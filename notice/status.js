const Member = require("../models/addmember");
const moment = require("moment");
const schedulePayment = require("../models/schedulePayment");
const StripeCards = require("../models/stripe_cards");
const StoreTransaction = require("../models/store_transactions");
const User = require("../models/user");
const class_schedule = require("../models/class_schedule");
const buyMembership = require("../models/buy_membership");
const all_temp = require("../models/emailSentSave");
const { filterSmartlist } = require("../controllers/smartlists");
const smartlist = require("../models/smartlists");
const Mailer = require("../helpers/Mailer");
const ObjectId = require("mongodb").ObjectId;
const cron = require("node-cron");

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

const expiredMembership = async (req, res) => {
  const expired_LastaMembership = await Member.aggregate([
    {
      $project: {
        membership_details: 1,
        status: 1,
      },
    },
    {
      $match: {
        membership_details: {
          $ne: [],
        },
      },
    },
    {
      $unwind: "$membership_details",
    },
    {
      $lookup: {
        from: "buy_memberships",
        localField: "membership_details",
        foreignField: "_id",
        as: "membership",
      },
    },
    {
      $project: {
        membership_id: { $first: "$membership._id" },
        status: 1,
        membership_status: { $first: "$membership.membership_status" },
        expiry_date: { $toDate: { $first: "$membership.expiry_date" } },
      },
    },
    {
      $project: {
        membership_id: 1,
        status: 1,
        membership_status: 1,
        expiry_date: 1,
        isExpired: {
          $cond: {
            if: { $lte: ["$expiry_date", new Date()] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);
  let buy_members = [];
  for (let i of expired_LastaMembership) {
    if (i.isExpired === true) {
      buy_members.push(i);
    }
  }
  for (let i of buy_members) {
    await buyMembership.updateOne(
      { _id: i.membership_id.toString() },
      { $set: { membership_status: "Expired" } }
    );
  }
  const uniqueIds = {};
  expired_LastaMembership.forEach((element) => {
    const isDuplicate = uniqueIds[element._id];
    if (!isDuplicate) {
      uniqueIds[element._id] = element;
    }
  });
  const uniqData = Object.values(uniqueIds);
  let array = [];
  for (let i of uniqData) {
    let obj = { _id: "", data: [] };
    obj._id = i._id;
    for (let j of expired_LastaMembership) {
      if (obj._id.toString() === j._id.toString()) {
        obj.data.push(j.membership_status);
      }
    }
    array.push(obj);
  }
  for (let i = 0; i < array.length; i++) {
    if (
      array[i].data.includes("Expired") &&
      !array[i].data.includes("Active")
    ) {
      await Member.updateOne(
        { _id: array[i]._id.toString() },
        { $set: { status: "Expired" } }
      );
    } else if (array[i].data.includes("Terminated")) {
      await Member.updateOne(
        { _id: array[i]._id.toString() },
        { $set: { status: "Expired" } }
      );
    }
  }
};

const activeMembership = async (req, res) => {
  const active = await Member.aggregate([
    {
      $project: {
        membership_details: 1,
        status: 1,
      },
    },
    {
      $match: {
        membership_details: {
          $ne: [],
        },
      },
    },
    {
      $unwind: "$membership_details",
    },
    {
      $lookup: {
        from: "buy_memberships",
        localField: "membership_details",
        foreignField: "_id",
        as: "membership",
      },
    },
    {
      $project: {
        _id: 1,
        membership_id: { $first: "$membership._id" },
        status: 1,
        membership_status: { $first: "$membership.membership_status" },
        expiry_date: { $toDate: { $first: "$membership.expiry_date" } },
      },
    },
    {
      $match: {
        $or: [
          { membership_status: { $eq: "Freeze" } },
          { membership_status: { $eq: "Active" } },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        membership_id: 1,
        status: 1,
        membership_status: 1,
        expiry_date: 1,
        isExpired: {
          $cond: {
            if: { $lte: ["$expiry_date", new Date()] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);
  const uniqueIds = {};
  active.forEach((element) => {
    const isDuplicate = uniqueIds[element._id];
    if (!isDuplicate) {
      uniqueIds[element._id] = element;
    }
  });
  const uniqData = Object.values(uniqueIds);
  let array = [];
  for (let i of uniqData) {
    let obj = { _id: "", data: [] };
    obj._id = i._id;
    for (let j of active) {
      if (obj._id.toString() === j._id.toString()) {
        obj.data.push(j.membership_status);
      }
    }
    array.push(obj);
  }
  for (let i = 0; i < array.length; i++) {
    if (array[i].data.includes("Freeze")) {
      await Member.updateOne(
        { _id: array[i]._id },
        { $set: { status: "Freeze" } }
      );
    } else if (
      array[i].data.includes("Active") &&
      !array[i].data.includes("Freeze")
    ) {
      await Member.updateOne(
        { _id: array[i]._id },
        { $set: { status: "Active" } }
      );
    }
  }
};

//Memberships
// expiredLastMembership = async (req,res) => {
// const expired_LastaMembership = await Member.aggregate([
//   {
//     $match: {
//       userId: "606aea95a145ea2d26e0f1ab"
//     }
//   },
//   {
//     $project: {
//       // last_membership: {
//       //   $cond: { if: { $eq: [{ $size: "$membership_details" }, 1] }, then: { $arrayElemAt: ["$membership_details", 0] }, else: { $arrayElemAt: ["$membership_details", -1] } }
//       // },
//       membership_details: 1,
//       status: 1,
//     },
//   },
//   {
//     $match: {
//       membership_details: {
//         $ne: []
//       }
//     }
//   },
//   {
//     $unwind: "$membership_details"
//   },
//   {
//     $lookup: {
//       from: "buy_memberships",
//       localField: "membership_details",
//       foreignField: "_id",
//       as: "membership",

// pipeline: [
//   {
//     $project: {
//       expiry_date: {
//         // $toDate: "$expiry_date",
//         $convert: {
//           input: "$expiry_date",
//           to: "date",
//           onError: "$expiry_date",
//           onNull: "$expiry_date",
//         },
//       },
//       membership_status: 1,
//     },
//   },
// {
//   $match: {
//     membership_status: {
//       $ne: ["Expired"],
//     },
//   },
// },
// ],
// },

// },
// {
//   $unwind: "$membership",
// },
// {
//   $match: {
//     $or: [{
//       "membership.expiry_date": {
//         $lte: new Date(),
//       }
//     }, {
//       "membership.membership_status": {
//         $eq: "Freeze",
//       }
//     }]
//   },
// },
// {
//   $project: {
//     membershipId: "$membership._id",
//   },
//   },
//   {
//     $project: {
//       membership_id: { $first: "$membership._id" },
//       status: 1,
//       membership_status: { $first: "$membership.membership_status" },
//       expiry_date: { $toDate: { $first: "$membership.expiry_date" } }
//     }
//   },
//   {
//     $match: {
//       $and: [{ membership_status: { $ne: "Freeze" } }, { membership_status: { $ne: "Terminated" } }]
//     }
//   },
//   {
//     $project: {
//       membership_id:1,
//       status: 1,
//       membership_status: 1,
//       expiry_date: 1,
//       isExpired: {
//         $cond: {
//           if: { $lte: ["$expiry_date", new Date()] },
//           then: true,
//           else: false
//         }
//       }
//     }
//   }

// ]);
// console.log("fghjhh>>>>>>", expired_LastaMembership)
// const uniqueIds = {};
// expired_LastaMembership.forEach(element => {
//   const isDuplicate = uniqueIds[element._id]
//   if (!isDuplicate) {
//     uniqueIds[element._id] = element
//   }
// })
// const uniqData = Object.values(uniqueIds)
// console.log(uniqData)
// let buy_members=[]
// for (let i of expired_LastaMembership){
//   if(i.isExpired===true){
//     buy_members.push(i)
//   }
// }

// console.log(buy_members)

// for (let i of uniqData) {
//   for (let j of expired_LastaMembership) {
//     if ((i._id).toString() === (j._id).toString()) {
//       if (j.isExpired === true && j.membership_status === "Active") {
//         await Member.updateOne({ _id: i._id.toString() }, { $set: { status: "Active" } })
//         console.log(i)
//       }
//     } else if (j.membership_status === "Freeze") {
//       await Member.updateOne({ _id: j._id.toString() }, { $set: { status: "Freeze" } })
//     } else {
//       await Member.updateOne({ _id: j._id.toString() }, { $set: { status: "Expired" } })
//     }
//   }
// }

// Promise.all(
//   expired_LastaMembership.map((expired_Membership) => {
//     update_LastMembershipStatus(expired_Membership)
//       .then((resp) => console.log("for test---", resp.nModified))
//       .catch((err) => {
//         console.log(err);
//       });
//   })
// );
// };

// expiredLastMembership()

// function update_LastMembershipStatus(member) {
//   console.log(member)

// let { _id, membership } = member;
// return new Promise((resolve, reject) => {
//   if (membership.membership_status === "Freeze") {
//     Member.updateOne({ _id: _id.toString() }, { $set: { status: "Freeze" } })
//       .then((resp) => {
//         buyMembership
//           .updateOne(
//             { _id: membership._id.toString() },
//             { $set: { membership_status: "Freeze" } }
//           )
//           .then((resp) => resolve(resp))
//           .catch((err) => reject(err));
//       })
//       .catch((err) => reject(err));
//   } else if (membership.membership_status === "Expired") {
//     Member.updateOne({ _id: _id.toString() }, { $set: { status: "Expired" } })
//       .then((resp) => {
//         buyMembership
//           .updateOne(
//             { _id: membership._id.toString() },
//             { $set: { membership_status: "Expired" } }
//           )
//           .then((resp) => resolve(resp))
//           .catch((err) => reject(err));
//       })
//       .catch((err) => reject(err));
//   }
// });
// }

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

const chargeEmiWithStripeCron = async () => {
  const todayDate = moment().format("yyyy-MM-DD");
  console.log(todayDate, "todayDate");
  await schedulePayment.find(
    {
      date: todayDate,
      status: "due",
      ptype: "credit card",
    },
    (error, dueEmiData) => {
      if (error) {
        console.log({
          msg: "Data is not found!",
          success: false,
          error: error,
        });
      } else {
        console.log(dueEmiData, "dueEmiData");
        Promise.all(
          dueEmiData?.map(async (dueEmiObj) => {
            const studentId = dueEmiObj.studentId;
            const userId = dueEmiObj.userId;
            const amount = dueEmiObj.Amount;
            const Id = dueEmiObj.Id;
            const purchased_membership_id = dueEmiObj.purchased_membership_id;
            const { stripe_sec } = await User.findOne({ _id: userId });
            const stripeObj = await require("stripe")(stripe_sec);
            // fetch stripe cards detail
            let stripeDetails = {};
            stripeDetails = await StripeCards?.findOne({
              studentId: studentId,
              isDefault: true,
            });
            if (stripeDetails === null) {
              stripeDetails = await StripeCards?.findOne({
                studentId: studentId,
              });
            }
            const card_id = stripeDetails.card_id;
            const customer_id = stripeDetails.customer_id;

            const paymentObj = {
              amount: amount * 100, //stripe uses cents
              currency: "usd",
              customer: customer_id,
              payment_method_types: ["card"],
              payment_method: card_id,
              confirm: "true",
              description: "Monthly Emi installment",
            };
            const paymentIntent = await stripeObj.paymentIntents.create(
              paymentObj
            );
            const storeTransaction = await StoreTransaction.create({
              ...paymentIntent,
              studentId,
              userId,
              purchased_membership_id,
              emiId: Id,
            });
            console.log(paymentIntent, "paymentIntent");
            if (
              paymentIntent?.statusCode === "200" ||
              paymentIntent?.status === "succeeded"
            ) {
              // update payment status
              await schedulePayment.updateOne(
                { studentId: studentId.toString(), Id: Id },
                { $set: { status: "paid" } }
              );
              // update membership status
              await buyMembership.updateOne(
                { _id: ObjectId(purchased_membership_id) },
                { $set: { membership_status: "Active" } }
              );
            }

            return {
              studentId,
              userId,
              purchased_membership_id,
              emiId: Id,
              paymentIntent,
            };
          })
        )
          .then((resdata) => {
            console.log({
              msg: "Emi payment completed!",
              data: resdata,
              success: true,
            });
          })
          .catch((error) => {
            console.log({
              msg: "Emi payment failed",
              success: false,
              error: error,
            });
          });
      }
    }
  );
};

// DailyTriggeredCrons();
module.exports = cron.schedule("* 1 * * * *", () => {
  collectionModify(),
    activeMembership(),
    expiredMembership(),
    chargeEmiWithStripeCron();
});
module.exports = cron.schedule(`*/1 * * * *`, () => emailCronFucntionality());

// DailyTriggeredStripe Charge script();
//module.exports = cron.schedule("0 1 * * *", () => chargeEmiWithStripeCron);

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
