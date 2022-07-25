const cron = require("node-cron");
const Member = require("../models/addmember");
const User = require("../models/user");
const class_schedule = require("../models/class_schedule");
const buyMembership = require("../models/buy_membership");
const all_temp = require("../models/emailSentSave");
const { filterSmartlist } = require("../controllers/smartlists");
const smartlist = require("../models/smartlists");
const Mailer = require("../helpers/Mailer");
const ObjectId = require("mongodb").ObjectId;

function getUserId() {
  return new Promise((resolve, reject) => {
    User.aggregate([
      {
        $match: {
          role: 0,
          isEmailverify: true,
        },
      },
      {
        $group: {
          _id: "",
          ids: { $push: "$_id" },
        },
      },
      {
        $project: {
          ids: 1,
          _id: 0,
        },
      },
    ])
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

//Memberships
var expiredLastMembership = async () => {
  const expired_LastaMembership = await Member.aggregate([
    {
      $project: {
        last_membership: {
          $arrayElemAt: ["$membership_details", -1],
        },
      },
    },
    {
      $match: {
        status: { $nin: ["Expired"] },
        last_membership: {
          $nin: [null],
        },
      },
    },
    {
      $lookup: {
        from: "buy_memberships",
        localField: "last_membership",
        foreignField: "_id",
        as: "membership",
        pipeline: [
          {
            $project: {
              expiry_date: {
                // $toDate: "$expiry_date",
                $convert: {
                  input: "$expiry_date",
                  to: "date",
                  onError: "$expiry_date",
                  onNull: "$expiry_date",
                },
              },
              membership_status: 1,
            },
          },
          // {
          //   $match: {
          //     membership_status: {
          //       $ne: ["Expired"],
          //     },
          //   },
          // },
        ],
      },
    },
    {
      $unwind: "$membership",
    },
    {
      $match: {
        "membership.expiry_date": {
          $lte: new Date(),
        },
      },
    },
    {
      $project: {
        membershipId: "$membership._id",
      },
    },
  ]);
  Promise.all(
    expired_LastaMembership.map((expired_Membership) => {
      update_LastMembershipStatus(expired_Membership)
        .then((resp) => console.log(resp.nModified))
        .catch((err) => {
          console.log(err);
        });
    })
  );
};

function update_LastMembershipStatus(member) {
  let { _id, membershipId } = member;
  return new Promise((resolve, reject) => {
    Member.updateOne({ _id: _id.toString() }, { $set: { status: "Expired" } })
      .then((resp) => {
        buyMembership
          .updateOne(
            { _id: membershipId.toString() },
            { $set: { membership_status: "Expired" } }
          )
          .then((resp) => resolve(resp))
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });
}

allexpiredMemberships = async () => {
  try {
    const expired_Membership = await buyMembership.aggregate([
      {
        $project: {
          membership_name: 1,
          membership_type: 1,
          membership_status: 1,
          studentInfo: 1,
          expiry_date: {
            // $toDate: "$expiry_date",
            $convert: {
              input: "$expiry_date",
              to: "date",
              onError: "$expiry_date",
              onNull: "$expiry_date",
            },
          },
        },
      },
      {
        $match: {
          expiry_date: {
            $lte: new Date(),
          },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);
    Promise.all(
      expired_Membership.map((expired_Membership) => {
        updateAllMembershipStatus(expired_Membership)
          .then((resp) => {})
          .catch((err) => {
            console.log(err);
          });
      })
    );
    console.log({ msg: "Membership status updated successfully" });
  } catch (ex) {
    throw new Error(ex);
  }
};
async function updateAllMembershipStatus(membership) {
  let { _id } = membership;
  return new Promise((resolve, reject) => {
    buyMembership
      .updateOne(
        { _id: _id.toString() },
        { $set: { membership_status: "Expired" } }
      )
      .then((resp) => resolve(resp))
      .catch((err) => reject(err));
  });
}

async function collectionModify() {
  try {
    const [allUsers] = await getUserId();
    // console.log(allUsers, allUsers.ids.length)
    const promise = [];
    var time = 0;

    var interval = setInterval(async function () {
      if (time < allUsers.ids.length) {
        const [data] = await Promise.all([
          Member.aggregate([
            { $match: { userId: allUsers.ids[time].toString() } },
            {
              $project: {
                last_attended_date: 1,
              },
            },
            {
              $match: { last_attended_date: { $ne: null } },
            },
            {
              $addFields: {
                last_attended_date: {
                  $toDate: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: {
                        $toDate: "$last_attended_date",
                      },
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                rating: {
                  $floor: {
                    $divide: [
                      {
                        $subtract: ["$$NOW", "$last_attended_date"],
                      },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
              },
            },
          ]),
        ]);
        Promise.all(
          data.map((member) => {
            update_Rating(member)
              .then((resp) => {
                // console.log(resp.n)
              })
              .catch((err) => {
                console.log(err);
              });
          })
        );
        time++;
      } else {
        clearInterval(interval);
        console.log({ msg: "rating updated successfully" });
      }
    }, 3000);
  } catch (err) {
    console.log({ msg: err.message.replace(/\"/g, ""), success: false });
  }
}
async function update_Rating(member) {
  let { _id, rating } = member;
  rating = rating == null ? 0 : rating;
  return new Promise((resolve, reject) => {
    Member.updateOne(
      { _id: _id.toString() },
      { $set: { rating: rating.toString() } }
    )
      .then((resp) => resolve(resp))
      .catch((err) => reject(err));
  });
}

//schedule-Mails
async function emailCronFucntionality() {
  let promises = [];
  let scheduledListing = await all_temp.find({
    is_Sent: false,
    email_type: "scheduled",
    adminId: { $exists: false },
  });
  scheduledListing.forEach(async (ele, i) => {
    let hours = parseInt(ele.sent_time.split(":")[0]);
    let mins = parseInt(ele.sent_time.split(":")[1]);
    let sentDate = new Date(ele.sent_date)
      .setHours(hours, mins)
      .toString()
      .slice(0, 10);
    let currentDate = new Date()
      .setHours(new Date().getHours(), new Date().getMinutes(), 0)
      .toString()
      .slice(0, 10);
    if (sentDate === currentDate) {
      if (!ele.to.length) {
        let smartLists = ele.smartLists;
        smartLists = ele.smartLists.map((s) => ObjectId(s));
        let smartlists = await smartlist.aggregate([
          { $match: { _id: { $in: smartLists } } },
          { $project: { criteria: 1, _id: 0 } },
        ]);
        let promises = [];
        smartlists.forEach((element, index) => {
          promises.push(filterSmartlist(element.criteria, ele.userId));
        });
        var data = await Promise.all(promises);
        data = [].concat.apply([], data);
        let mapObj = await students.find(
          {
            _id: { $in: data },
            userId: ele.userId,
            email: { $nin: [undefined, ""] },
          },
          { email: 1, _id: 0 }
        );

        let rest = [...new Set(mapObj.map((element) => element.email))];
        if (ele.isPlaceHolders) {
          let mapObj = await students.find({
            _id: { $in: data },
            userId: ele.userId,
          });

          Promise.all(
            mapObj.map((Element) => {
              let temp = ele.template;
              for (i in Element) {
                if (temp.includes(i)) {
                  temp = replace(temp, i, Element[i]);
                }
              }
              const emailData = new Mailer({
                to: [Element["email"]],
                from: ele.from,
                subject: ele.subject,
                html: temp,
                attachments: ele.attachments,
              });
              emailData.sendMail();
            })
          )

            .then(async (resp) => {
              return Promise.all([
                await all_temp.findOneAndUpdate(
                  { _id: ele._id },
                  { $set: { is_Sent: true } }
                ),
              ]);
            })
            .catch((err) => {
              throw new Error(err);
            });
        } else if (rest.length) {
          const emailData = new Mailer({
            to: rest,
            from: ele.from,
            subject: ele.subject,
            html: ele.template,
            attachments: ele.attachments,
          });
          emailData
            .sendMail()
            .then(async (resp) => {
              return Promise.all([
                await all_temp.findOneAndUpdate(
                  { _id: ele._id },
                  { $set: { is_Sent: true } }
                ),
              ]);
            })
            .catch((err) => {
              throw new Error(err);
            });
        }
      } else {
        const emailData = new Mailer({
          to: ele.to,
          from: ele.from,
          subject: ele.subject,
          html: ele.template,
          attachments: ele.attachments,
        });
        emailData
          .sendMail()
          .then((resp) => {
            return Promise.all([
              all_temp.findOneAndUpdate(
                { _id: ele._id },
                { $set: { is_Sent: true } }
              ),
            ]);
          })
          .catch((err) => {
            throw new Error(err);
          });
      }
    }
  });
  // await Promise.all(promises);
}

async function DailyTriggeredMails() {
  try {
    const [allUsers] = await getUserId();
    const promise = [];
    var time = 0;

    var interval = setInterval(async function () {
      if (time < allUsers.ids.length) {
        console.log(allUsers.ids[time]);
        const [data] = await Promise.all([
          Member.aggregate([
            { $match: { userId: allUsers.ids[time].toString() } },
            {
              $project: {
                last_attended_date: 1,
              },
            },
            {
              $match: { last_attended_date: { $ne: null } },
            },
            {
              $addFields: {
                last_attended_date: {
                  $toDate: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: {
                        $toDate: "$last_attended_date",
                      },
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                rating: {
                  $floor: {
                    $divide: [
                      {
                        $subtract: ["$$NOW", "$last_attended_date"],
                      },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
              },
            },
          ]),
        ]);
        Promise.all(
          data.map((member) => {
            update_Rating(member)
              .then((resp) => {
                // console.log(resp.n)
              })
              .catch((err) => {
                console.log(err);
              });
          })
        );
        time++;
      } else {
        clearInterval(interval);
        console.log({ msg: "rating updated successfully" });
      }
    }, 3000);
  } catch (err) {
    console.log({ msg: err.message.replace(/\"/g, ""), success: false });
  }
}

// DailyTriggeredMails();
module.exports = cron.schedule("0 1 * * *", () => {
  collectionModify(), expiredLastMembership();
});

module.exports = cron.schedule(`*/1 * * * *`, () => emailCronFucntionality());

// module.exports = cron.schedule('*/20 * * * * *',function(){
//     let options = {
//         timeZone: 'Asia/Kolkata',
//         hour: 'numeric',
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric',
//         minute: 'numeric',
//         second: 'numeric',
//         },

//         formatter = new Intl.DateTimeFormat([], options);
//         var a =(formatter.format(new Date()));

//         var str = a
//         var h = str.split(",");
//         var dates = h[0]
//         var d = dates.split('/')
//         var dateary = d
//         // var hms = h[1].split(':')
//         // 4/21/2021, 11:08:00 AM dt
// // 0|app       | 4/21/2021  11:08:00 AM split_td
// // 0|app       | [ ' 11', '08', '00 AM' ] splitT
// // 0|app       | 2021 20 4  11 08 0 0
// // 0|app       | 2022-09-04T11:08:00.000Z cur
// // 0|app       | data not come

// // var h1 = '11:08:00 AM'
// // var time12h=h1 // time change in 24hr
// // const [time, modifier] = time12h.split(' ');
// // let [hours, minutes] = time.split(':');
// // if (hours === '12') {
// //   hours = '00';
// // }
// // if (modifier === 'PM') {
// //   hours = parseInt(hours, 10) + 12;
// // }

// // run
// // 0|app  | 4/21/2021, 11:59:00 AM dt
// // 0|app  | 4/21/2021  11:59:00 AM split_td
// // 0|app  | [ '', '11:59:00', 'AM' ] 24hour_am_pm
// // 0|app  | [ '' ] hour_m
// // 0|app  | { hour: '', min: 'undefined' }
// // 0|app  |  undefined
// // 0|app  | 2021 3 21  undefined 0 0
// // 0|app  | Invalid Date cur
// // 0|app  | data not come

//         var time12h=h[1] // time change in 24hr
//         var tisp = time12h.split(' ');
//         const [b,time, modifier] = time12h.split(' ');
//         var ti = time.split(':')
//         let [hours, minutes] = time.split(':');
//         if (hours === '12') {
//             hours = '00';
//         }
//         if (modifier === 'PM') {
//         hours = parseInt(hours, 10) + 12;
//       }
//       console.log(msg= {hour:`${hours}`,min:`${minutes}`})
//       console.log(msg.hour,msg.min)

//         var y = d[2]
//         var mo = parseInt(dateary[0])-1
//         var d = parseInt(dateary[1])
//         var h = msg.hour
//         var mi = msg.min
//         var se = '0'
//         var mil = '0'
//         var curdat = new Date(y,mo,d,h,mi,se,mil)

//         emailsentsave.aggregate([
//             {
//                 $match: {
//                     $and: [{ email_status: true },{email_type:'schedule'},
//                     { $expr: { $eq: [{ $month: '$DateT' }, { $month: curdat }] } },
//                     { $expr: { $eq: [{ $dayOfMonth: '$DateT' }, { $dayOfMonth: curdat }] } },
//                     { $expr: { $eq: [{ $year: '$DateT' }, { $year: curdat }] } },
//                     { $expr: { $eq: [{ $hour: '$DateT' }, { $hour: curdat }] } },
//                     { $expr: { $eq: [{ $minute: '$DateT' }, { $minute: curdat }] } },
//                     ]
//                 }
//             }
//         ]).exec((err,resp)=>{
//             if(resp.length >0){
//             var Data = resp
//             Data.forEach((row)=>{
//                 var to = row.to
//                 var from = row.from
//                 var sub = row.subject
//                 var template = row.template
//                 var dmy = row.DateT
//                     const emailData = {
//                         sendgrid_key:'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',
//                         to:to,
//                         from_email: from,
//                         from_name: 'noreply@gmail.com',
//                     };
//                     emailData.subject = sub;
//                     emailData.content = template;

//                     sgMail.send_via_sendgrid(emailData).then(resp => {
//                         emailsentsave.findByIdAndUpdate(row._id, {$set:{email_type:'sent'}})
//                             .exec((err, emailUpdate) => {
//                                 if (err) {
//                                     res.send('email status is not update')
//                                 }
//                                 else {
//                                     res.send('email sent successfully status schdule sent')
//                                 }
//                             })
//                     }).catch(err => {
//                         res.send(err)
//                     })
//             })

//         }
//         else{
//             console.log('data not come')
//         }
// })
// })

// // module.exports = cron.schedule('*/60 * * * * *',function(){
// // EmailSent.find({$and:[{email_type:'schedule'},{email_status:true}]})
// //     .exec((err,scheduleData)=>{
// //         if(err){
// //         }
// //         else{
// //             var Data = scheduleData
// //             Data.forEach((row)=>{
// //                 var Auth = row.email_auth_key
// //                 var to = row.to
// //                 var from = row.from
// //                 var sub = row.subject
// //                 var d = new Date(row.sent_date)
// //                 var time = row.sent_time
// //                 var tsplit = time.split(':')
// //                 var date = d.getDate()
// //                 var mon = d.getMonth()+1
// //                 var hour = tsplit[0]
// //                 var min = tsplit[1]

// //                 cron.schedule(`${min} ${hour} ${date} ${mon} *`, function() {
// //                     const emailData = {
// //                         sendgrid_key:Auth,
// //                         to:to,
// //                         from_email: from,
// //                         from_name: 'noreply@gmail.com',
// //                     };
// //                     emailData.subject = sub;
// //                     emailData.content = '<h1>hello sir i am ok</h1>';

// //                     sgMail.send_via_sendgrid(emailData).then(resp => {
// //                     EmailSent.findByIdAndUpdate(row._id, {$set:{email_type:'sent'}})
// //                             .exec((err, emailUpdate) => {
// //                                 if (err) {
// //                                     res.send('email status is not update')
// //                                 }
// //                                 else {
// //                                     res.send('email sent successfully status schdule sent')
// //                                 }
// //                             })
// //                     }).catch(err => {
// //                         res.send('email not send')
// //                     })
// //             })

// //             })
// //         }
// //     })
// // })
