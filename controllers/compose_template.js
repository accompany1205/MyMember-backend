const all_temp = require("../models/emailSentSave");
const students = require("../models/addmember");
const compose_folder = require("../models/email_compose_folder");
const authKey = require("../models/email_key");
const async = require("async");
const sgMail = require("sendgrid-v3-node");
const moment = require("moment");
const mongoose = require("mongoose")
var request = require("request");
const User = require("../models/user");
const cron = require("node-cron");
const axios = require("axios");
const cloudUrl = require("../gcloud/imageUrl");
const ObjectId = require('mongodb').ObjectId;
// compose template

function timefun(sd, st) {
  var date = sd;
  var stime = st;
  var spD = date.split("/");
  var spT = stime.split(":");

  var y = spD[2];
  var mo = parseInt(spD[0]) - 1;
  var d = parseInt(spD[1]);
  var h = spT[0];
  var mi = spT[1];
  var se = "0";
  var mil = "0";
  return (curdat = new Date(y, mo, d, h, mi, se, mil));
}

exports.getData = (req, res) => {
  let options = {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    minute: "numeric",
    second: "numeric",
  },
    formatter = new Intl.DateTimeFormat([], options);

  var a = formatter.format(new Date());
  // var str = a
  // var h = str.split(",");
  // var dates = h[0]
  // var d = dates.split('/')
  // var curdat = new Date(`${d[1]} ${d[0]} ${d[2]} ${h[1]}`)

  var str = a;
  var h = str.split(",");
  var dates = h[0];
  var d = dates.split("/");

  var time12h = h[1]; // time change in 24hr
  const [b, time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") {
    hours = "00";
  }
  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  var y = d[2];
  var mo = d[1] - 1;
  var d = d[0];
  var h = msg.hour;
  var mi = msg.min;
  var se = "0";
  var mil = "0";
  var curdat = new Date(y, mo, d, h, mi, se, mil);

  all_temp
    .aggregate([
      {
        $match: {
          $and: [
            { email_status: true },
            { $expr: { $eq: [{ $month: "$DateT" }, { $month: curdat }] } },
            {
              $expr: {
                $eq: [{ $dayOfMonth: "$DateT" }, { $dayOfMonth: curdat }],
              },
            },
            { $expr: { $eq: [{ $year: "$DateT" }, { $year: curdat }] } },
            { $expr: { $eq: [{ $hour: "$DateT" }, { $hour: curdat }] } },
            { $expr: { $eq: [{ $minute: "$DateT" }, { $minute: curdat }] } },
          ],
        },
      },
    ])
    .exec((err, resp) => {
      if (err) {
        res.json({ code: 400, msg: "data not found" });
      } else {
        res.json({ code: 200, msg: resp });
      }
    });
};

exports.single_temp_update_status = (req, res) => {
  if (req.body.email_status == true) {
    all_temp.updateOne(
      { _id: req.params.tempId },
      { $set: { email_status: true } },
      (err, resp) => {
        if (err) {
          res.json({ code: 400, msg: "email status not deactive" });
        } else {
          res.json({ code: 200, msg: "email status active successfully" });
        }
      }
    );
  } else if (req.body.email_status == false) {
    all_temp.updateOne(
      { _id: req.params.tempId },
      { $set: { email_status: false } },
      (err, resp) => {
        if (err) {
          res.json({ code: 400, msg: "email status not active" });
        } else {
          res.json({ code: 200, msg: "email status deactive successfully" });
        }
      }
    );
  }
};

exports.status_update_template = (req, res) => {
  if (req.body.email_status == false) {
    all_temp
      .find({
        $and: [
          { userId: req.params.userId },
          { folderId: req.params.folderId },
        ],
      })
      .exec((err, TempData) => {
        if (err) {
          res.send({ code: 400, msg: "all email template not deactive" });
        } else {
          async.eachSeries(
            TempData,
            (obj, done) => {
              all_temp.findByIdAndUpdate(
                obj._id,
                { $set: { email_status: false } },
                done
              );
            },
            function Done(err, List) {
              if (err) {
                res.send(err);
              } else {
                res.send({ msg: "this folder all template is deactivate" });
              }
            }
          );
        }
      });
  } else if (req.body.email_status == true) {
    all_temp
      .find({
        $and: [
          { userId: req.params.userId },
          { folderId: req.params.folderId },
        ],
      })
      .exec((err, TempData) => {
        if (err) {
          res.send({ code: 400, msg: "all email template not active" });
        } else {
          async.eachSeries(
            TempData,
            (obj, done) => {
              all_temp.findByIdAndUpdate(
                obj._id,
                { $set: { email_status: true } },
                done
              );
            },
            function Done(err, List) {
              if (err) {
                res.send(err);
              } else {
                res.send({ msg: "this folder all template is activate" });
              }
            }
          );
        }
      });
  }
};

exports.allSent = async (req, res) => {
  all_temp.find({ userId: req.params.userId, is_Sent: true }).exec((err, data) => {
    if (err) {
      res.send({ success: false, mag: "data not fetched" })
    } else {
      res.send({ success: true, msg: "fetched!", data })
    }
  })
}

exports.sendVerificationMail = async (req, res) => {
  try {
    let userId = req.params.userId;
    let reqData = req.body;
    let key = process.env.SENDGRID_API_KEY;
    var options = {
      method: 'POST',
      url: 'https://api.sendgrid.com/v3/verified_senders',
      headers:
      {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`
      },
      body:
      {
        nickname: reqData.nickname,
        from_email: reqData.from_email,
        from_name: reqData.from_name,
        reply_to: reqData.reply_to,
        reply_to_name: reqData.reply_to_name,
        address: reqData.address,
        address2: reqData.address2,
        state: reqData.state,
        city: reqData.city,
        zip: reqData.zip,
        country: reqData.country
      },
      json: true
    };
    await User.findByIdAndUpdate(userId, { $push: { sendgridVerification: { staffName: reqData.staffName, password: reqData.password, email: reqData.from_email } } })

    // let staffuser = new User({
    //   username: reqData.staffName,
    //   password: reqData.password
    // })
    // staffuser.save((err, user) => {
    //   if (err) {
    //     res.send({ error: err.message.replace(/\"/g, ""), success: false })
    //   }
    // })

    request(options, function (errors, response, body) {
      if (errors || body.errors) { res.send({ success: false, msg: body.errors }) }
      else {
        res.send({ msg: "verification link sent!", success: true, body })
      }
    });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }

}

exports.all_email_list = async (req, res) => {
  all_temp.find({ userId: req.params.userId, is_Sent: true }).exec((err, allTemp) => {
    if (err) {
      res.send({ code: 400, msg: "email list not found" });
    } else {
      res.send({ code: 200, msg: allTemp });
    }
  });
};
exports.isFavorite = async (req, res) => {
  all_temp.find({ userId: req.params.userId, is_Favorite: true }).exec((err, allTemp) => {
    if (err) {
      res.send({ code: 400, msg: "not found" });
    } else {
      res.send({ code: 200, msg: allTemp });
    }
  });
};
exports.swapAndUpdate_template = async (req, res) => {
  if (req.body.length < 1) {
    res.send({ message: "invalid input" });
  } else {
    const updateTO = req.body.updateTo;
    const ObjectIdOfupdateTo = req.body.ObjectIdOfupdateTo;
    const updateFrom = req.body.updateFrom;
    const ObjectIdOfupdateFrom = req.body.ObjectIdOfupdateFrom;
    const first = await all_temp.findByIdAndUpdate(ObjectIdOfupdateTo, {
      templete_Id: updateFrom,
    });
    const second = await all_temp
      .findByIdAndUpdate(ObjectIdOfupdateFrom, { templete_Id: updateTO })

      .exec((err, allTemp) => {
        if (err) {
          res.send({ code: 400, msg: "email list not found" });
        } else {
          res.send({
            code: 200,
            msg: "drag and droped successfully",
            success: true,
          });
        }
      });
  }
};

exports.list_template = async (req, res) => {
  compose_folder
    .findById(req.params.folderId)
    .populate({
      path: "template",
      match: { is_Sent: false, email_type: 'schedule' },
      options: { sort: { templete_Id: 1 } },
    })
    .exec((err, template_data) => {
      if (err) {
        res.send({ error: "Compose template list not found" });
      } else {
        res.send(template_data);
      }
    });
};

exports.allScheduledListing = async (req, res) => {
  await all_temp.find({ userId: req.params.userId, is_Sent: false })
    .then((data) => {
      res.send({ success: true, msg: "all Schedulded Emails", data })
    }).catch(err => {
      throw new Error("Not able to fetch Data", err);
    })
}

exports.update_template = async (req, res) => {
  let updateTemplate = req.body;
  let smartList = updateTemplate.smartLists;
  let to = updateTemplate.to;
  to = to ? JSON.parse(to) : [];
  smartList = smartList ? JSON.parse(smartList) : [];
  if (to || smartList) {
    if (!to.lenght) {
      smartList.map(lists => {
        to = [...to, ...lists.smrtList]
      });
    } else {
      smartList = []
    }
  }
  const promises = []
  if (req.files) {
    (req.files).map(file => {
      promises.push(cloudUrl.imageUrl(file))
    });
    var allAttachments = await Promise.all(promises);
    updateTemplate.attachments = allAttachments;
  }
  console.log("-->", updateTemplate)
  all_temp.updateOne(
    { _id: req.params.templateId },
    req.body,
    (err, updateTemp) => {
      if (err) {
        res.send({ success: false, msg: "template is not update" });
      } else {
        res.send({ success: true, msg: "template update success" });
      }
    }
  );
};

exports.add_template = async (req, res) => {
  try {
    const counts = await all_temp
      .find({ folderId: req.params.folderId })
      .countDocuments();
    let templete_Id = counts + 1;

    let {
      to,
      from,
      title,
      subject,
      template,
      sent_time,
      repeat_mail,
      sent_date,
      follow_up,
      smartLists
    } = req.body || {};
    to = to ? JSON.parse(to) : [];
    smartLists = smartLists ? JSON.parse(smartLists) : [];
    let { userId, folderId } = req.params || {};
    if (!to.lenght) {
      smartLists.map(lists => {
        to = [...to, ...lists.smrtList]
      });
    }
    const obj = {
      to,
      from,
      title,
      subject,
      template,
      sent_date,
      sent_time,
      DateT: date_iso_follow,
      repeat_mail,
      follow_up,
      email_type: "schedule",
      email_status: true,
      category: "compose",
      userId,
      folderId,
      templete_Id,
      attachments,
      smartLists
    };
    const promises = []
    if (req.files) {
      (req.files).map(file => {
        promises.push(cloudUrl.imageUrl(file))
      });
      var attachments = await Promise.all(promises);
    }
    obj.attachments = attachments
    // Formated Date //
    sent_date = moment(sent_date).format("YYYY-MM-DD");
    // let scheduleDateOfMonth = moment(sent_date).format('DD')
    // let scheduleMonth = moment(sent_date).format('MM')
    // let scheduleDay = moment(sent_date).format('dddd')

    if (req.body.follow_up === 0) {
      var date_iso = timefun(req.body.sent_date, req.body.sent_time);
      obj.DateT = date_iso;
    } else if (req.body.follow_up < 0) {
      res.send({ code: 400, msg: "follow up not set less then 0" });
    } else {
      var date_iso_follow = timefun(req.body.sent_date, req.body.sent_time);
      date_iso_follow.setDate(date_iso_follow.getDate() + req.body.follow_up);
      var nD = moment(date_iso_follow).format("MM/DD/YYYY");
      saveEmailTemplate(obj)
        .then((data) => {
          compose_folder
            .findOneAndUpdate(
              { _id: folderId },
              { $push: { template: data._id } }
            )
            .then((data) => {
              res.send({
                msg: `Email scheduled  Successfully on ${sent_date}`,
                success: true,
              });
            })
            .catch((er) => {
              res.send({
                error: "compose template details is not add in folder",
                success: false,
              });
            });
        })
        .catch((ex) => {
          res.send({
            success: false,
            msg: ex.message,
          });
        });
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }

};

function saveEmailTemplate(obj) {
  return new Promise((resolve, reject) => {
    let emailDetail = new all_temp(obj);
    emailDetail.save((err, data) => {
      if (err) {
        reject({ data: "Data not save in Database!", success: false });
      } else {
        resolve(data);
      }
    });
  });
}


var emailCronFucntionality = async () => {
  let promises = [];
  let scheduledListing = await all_temp.find({ category: "compose", is_Sent: false });
  scheduledListing.forEach(async (ele) => {
    let sentDate = ele.sent_date;
    let mailId = ele._id;
    let currentDate = moment().format("YYYY-MM-DD");
    if (sentDate === currentDate && !ele.is_Sent) {
      const emailData = {
        sendgrid_key: process.env.SENDGRID_API_KEY,
        to: ele.to,
        from_email: process.env.from_email,
        //from_name: "noreply@gmail.com",
        subject: ele.subject,
        content: ele.template,
        //attachments:ele.attachments
      };
      if (ele.is_Sent === false) {
        sgMail
          .send_via_sendgrid(emailData)
          .then(resp => {
            try {
              all_temp.findByIdAndUpdate(mailId, { is_Sent: true });
            } catch (err) {
              throw new Error("Mail status not updated", err)
            }
          })
          .catch((err) => {
            throw new Error(err);
          });
      } else {
        throw new Error("No email Scheduled for this Email");
      }
    }
  });
  await Promise.all(promises);
};

// cron.schedule(`*/5 * * * *`, () => {
//   emailCronFucntionality();
// });


exports.remove_template = (req, res) => {
  // all_temp.remove({}).then().catch();
  all_temp.findByIdAndRemove(req.params.templateId, (err, removeTemplate) => {
    if (err) {
      res.send({ error: "compose template is not remove" });
    } else {
      compose_folder.updateOne(
        { template: removeTemplate._id },
        { $pull: { template: removeTemplate._id } },
        function (err, temp) {
          if (err) {
            res.send({
              error: "compose template details is not remove in folder",
            });
          } else {
            res.send({ msg: "compose template is remove successfully" });
          }
        }
      );
    }
  });
};

exports.multipal_temp_remove = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const templateIds = req.body.templateId;
    const promises = [];
    for (let id of templateIds) {
      promises.push(all_temp.remove({ _id: id }));
      compose_folder.updateOne(
        { _id: folderId },
        { $pull: { template: ObjectId(id) } }).then((err, res) => {
          if (err) {
            throw new Error('folder not updated')
          }
        })
    }
    Promise.all(promises);
    res.send({
      msg: "Successfuly Removed Templates",
      success: true
    });
  } catch (err) {
    throw new Error(err);
  }

};


exports.criteria_met = async (req, res) => {
  let userId = req.params.userId
  let folderId = req.params.folderId
  try {
    const {
      to,
      from,
      subject,
      template,
      sent_time,
      sent_date,
      smartLists,
      days
    } = req.body;
    const obj = {
      to,
      from,
      subject,
      template,
      sent_date,
      sent_time,
      email_type: "schedule",
      email_status: true,
      category: "nurturing",
      userId,
      folderId,
      smartLists,
      days
    }
    saveEmailTemplate(obj)
      .then((data) => {
        compose_folder
          .findOneAndUpdate(
            { _id: folderId },
            { $push: { template: data._id } }
          )
          .then((data) => {
            res.send({
              msg: `Email scheduled  Successfully on ${sent_date}`,
              success: true,
            });
          })
          .catch((er) => {
            res.send({
              error: "compose template details is not add in folder",
              success: er,
            });
          });
      })
      .catch((er) => {
        res.send({
          success: false,
          msg: er
        });
      });
    // let dayofMonth = parseInt(moment(new Date()).add(days, "days").format('DD'))
    // let Month = parseInt(moment(new Date()).add(days, "days").format('MM'))
    // let objectIdArray = smartLists.map(s => mongoose.Types.ObjectId(s));
    // let scheduleData = await students.aggregate([
    //   {
    //     $match: {
    //       _id: { $in: objectIdArray }
    //     }
    //   },
    //   {
    //     $project: {
    //       email: 1,
    //       dob: 1,
    //     }
    //   },
    // {
    //   $match: {
    //     $expr: {
    //       $and: [
    //         { $eq: [{ $month: "$dob" }, Month] },
    //         { $eq: [{ $dayOfMonth: "$dob" }, dayofMonth], }
    //       ]
    //     },
    //   },
    // }
    // ]
    // )

    // scheduleData.forEach(element => {
    //   const emailData = {
    //     sendgrid_key: process.env.SENDGRID_API_KEY,
    //     to: to,
    //     from_email: from,
    //     subject: subject,
    //     content: template,
    //     //attachments:ele.attachments
    //   };
    //   sgMail
    //     .send_via_sendgrid(emailData)
    //     .then(resp => {
    //       try {
    //         all_temp.findByIdAndUpdate(mailId, { is_Sent: true });
    //       } catch (err) {
    //         throw new Error("Mail status not updated", err)
    //       }
    //     })
    //     .catch((err) => {
    //       throw new Error(err);
    //     });
    // })

    // res.send({ scheduleData })
  }
  catch (err) {
    throw new Error(err);
  }

};


var emailCronFucntionalityfor30DaysBirthday = async () => {
  let promises = [];

  let scheduledListing = await all_temp.find({ category: "nurturing", is_Sent: false });


  scheduledListing.forEach(async (ele) => {
    let days = ele.days;
    let dayofMonth = parseInt(moment(new Date()).add(days, "days").format('DD'))
    let Month = parseInt(moment(new Date()).add(days, "days").format('MM'))
    let objectIdArray = ele.smartLists.map(s => mongoose.Types.ObjectId(s));
    let scheduleData = await students.aggregate([
      {
        $match: {
          _id: { $in: objectIdArray }
        }
      },
      {
        $project: {
          email: 1,
          dob: 1,
        }
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $month: "$dob" }, Month] },
              { $eq: [{ $dayOfMonth: "$dob" }, dayofMonth], }
            ]
          },
        },
      }
    ]
    )
    if (scheduleData.length) {
      scheduleData.map(i => {

        const emailData = {
          sendgrid_key: process.env.SENDGRID_API_KEY,
          to: i.email,
          from_email: ele.from,
          subject: ele.subject,
          content: ele.template,
        };
        sgMail
          .send_via_sendgrid(emailData)
          .then(async (resp) => {
            try {
              await all_temp.findOneAndUpdate({ _id: ele._id }, { $set: { is_Sent: true } });
            } catch (err) {
              throw new Error("Mail status not updated", err)
            }
          })
          .catch((err) => {
            throw new Error(err)
          });
      })


    }
    {
      console.warn("no Email scheduled for this crone !")
    }
  })
  await Promise.all(promises);
};

cron.schedule("0 0 * * *", () => emailCronFucntionalityfor30DaysBirthday())
