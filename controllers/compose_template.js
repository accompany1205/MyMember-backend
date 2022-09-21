const all_temp = require("../models/emailSentSave");
const students = require("../models/addmember");
const smartlist = require("../models/smartlists");
const compose_folder = require("../models/email_compose_folder");
const template = require("../models/emailTemplates");
const authKey = require("../models/email_key");
const async = require("async");
const Mailer = require("../helpers/Mailer");
// const sgMail = require("sendgrid-v3-node");
const moment = require("moment");
const mongoose = require("mongoose");
var request = require("request");
const User = require("../models/user");
const cron = require("node-cron");
const axios = require("axios");
const cloudUrl = require("../gcloud/imageUrl");
const ObjectId = require("mongodb").ObjectId;
const { filterSmartlist } = require("../controllers/smartlists");
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

exports.sendImageResp = (req, res) => {
  if (req.files) {
    (req.files).map(file => {
      cloudUrl.imageUrl(file).then(data => {
        return res.send({ msg: "Image", success: true, data:data });
      })
    })

  } else {
    res.send({ msg: "No image uploaded", success: false })
  }
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
  if (req.body.is_Favorite) {
    template.updateOne(
      { _id: req.params.tempId },
      { $set: { is_Favorite: true } },
      (err, resp) => {
        if (err) {
          res.json({ success: false, msg: "email status not deactive" });
        } else {
          res.json({
            success: true,
            msg: "Template marked as stared successfully",
          });
        }
      }
    );
  } else {
    template.updateOne(
      { _id: req.params.tempId },
      { $set: { is_Favorite: false } },
      (err, resp) => {
        if (err) {
          res.json({ success: false, msg: "email status not active" });
        } else {
          res.json({ success: true, msg: "Template marked as unstar" });
        }
      }
    );
  }
};

exports.status_update_template = (req, res) => {
  if (req.body.is_Favorite == false) {
    template
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
              template.findByIdAndUpdate(
                obj._id,
                { $set: { is_Favorite: false } },
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
  } else if (req.body.is_Favorite == true) {
    template
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
              template.findByIdAndUpdate(
                obj._id,
                { $set: { is_Favorite: true } },
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
  all_temp
    .find({ userId: req.params.userId, is_Sent: true })
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        res.send({ success: false, mag: "data not fetched" });
      } else {
        res.send({ success: true, msg: "fetched!", data });
      }
    });
};

exports.sendVerificationMail = async (req, res) => {
  try {
    let userId = req.params.userId;
    let reqData = req.body;
    let key = process.env.SENDGRID_API_KEY;
    var options = {
      method: "POST",
      url: "https://api.sendgrid.com/v3/verified_senders",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: {
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
        country: reqData.country,
      },
      json: true,
    };
    await User.findByIdAndUpdate(userId, {
      $push: {
        sendgridVerification: {
          staffName: reqData.staffName,
          password: reqData.password,
          email: reqData.from_email,
        },
      },
    });

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
      if (errors || body.errors) {
        res.send({ success: false, msg: body.errors });
      } else {
        res.send({ msg: "verification link sent!", success: true, body });
      }
    });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.all_email_list = async (req, res) => {
  all_temp
    .find({ userId: req.params.userId, is_Sent: true })
    .exec((err, allTemp) => {
      if (err) {
        res.send({ code: 400, msg: "email list not found" });
      } else {
        res.send({ code: 200, msg: allTemp });
      }
    });
};
exports.isFavorite = async (req, res) => {
  all_temp
    .find({ userId: req.params.userId, is_Favorite: true })
    .exec((err, allTemp) => {
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

exports.allScheduledListing = async (req, res) => {
  await all_temp
    .find({
      userId: req.params.userId,
      is_Sent: false,
      email_type: "scheduled",
    })
    .sort({ createdAt: -1 })
    .then((data) => {
      res.send({ success: true, msg: "all Schedulded Emails", data });
    })
    .catch((err) => {
      throw new Error("Not able to fetch Data", err);
    });
};

exports.update_template = async (req, res) => {
  let updateTemplate = req.body;
  let templateId = req.params.templateId;
  try {
    if (!updateTemplate.to) {
      updateTemplate.smartLists = updateTemplate.smartLists
        ? JSON.parse(updateTemplate.smartLists)
        : [];
      updateTemplate.to = [];
    } else {
      updateTemplate.to = JSON.parse(updateTemplate.to);
      updateTemplate.smartLists = [];
    }
    let attachments = [];
    if (req.files) {
      req.files.map((file) => {
        let content = new Buffer.from(file.buffer, "utf-8");
        let attach = {
          content: content,
          filename: file.originalname,
          type: `application/${file.mimetype.split("/")[1]}`,
          disposition: "attachment",
        };
        attachments.push(attach);
      });
    }
    const resolvAttachments = await Promise.all(attachments);
    updateTemplate.attachments = resolvAttachments;
    await template.updateOne(
      { _id: templateId },
      { $set: updateTemplate },
      (err, updateTemp) => {
        if (err) {
          res.send({ success: err, msg: "Template is not update" });
        } else {
          res.send({ success: true, msg: "Template updated Successfully!" });
        }
      }
    );
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.sendEmail = async (req, res) => {
  let userId = req.params.userId;
  try {
    if (!req.body.template) {
      res.send({ error: "invalid input", success: false });
    }
    emailBody = req.body;
    emailBody.userId = userId;

    let attachments = [];
    if (req.files) {
      req.files.map((file) => {
        let content = new Buffer.from(file.buffer, "utf-8");
        let attach = {
          content: content,
          filename: file.originalname,
          type: `application/${file.mimetype.split("/")[1]}`,
          disposition: "attachment",
        };
        attachments.push(attach);
      });
    }
    const Allattachments = await Promise.all(attachments);
    emailBody.attachments = Allattachments;
    emailBody.category = "compose";
    emailBody.to = emailBody.to ? JSON.parse(emailBody.to) : undefined;
    if (!emailBody.to && JSON.parse(emailBody.immediately)) {
      emailBody.smartLists = emailBody.smartLists
        ? JSON.parse(emailBody.smartLists)
        : [];
      smartLists = emailBody.smartLists.map((s) => ObjectId(s));
      let smartlists = await smartlist.aggregate([
        { $match: { _id: { $in: smartLists } } },
        { $project: { criteria: 1, _id: 0 } },
      ]);
      let promises = [];
      smartlists.forEach((element, index) => {
        promises.push(filterSmartlist(element.criteria, userId));
      });
      var data = await Promise.all(promises);
      data = [].concat.apply([], data);
      let mapObj = await students.find(
        {
          _id: { $in: data },
          userId: userId,
          email: { $nin: [undefined, ""] },
        },
        { email: 1, _id: 0 }
      );

      let rest = [...new Set(mapObj.map((element) => element.email))];
      if (!rest.length) {
        return res.send({
          msg: `No Smartlist exist!`,
          success: false,
        });
      }
      emailBody.to = rest;
    }
    if (JSON.parse(emailBody.immediately)) {
      if (JSON.parse(emailBody.isPlaceHolders)) {
        let mapObj = await students.find({
          _id: { $in: data },
          email: { $nin: [undefined, ""] },
          userId: userId,
        });
        Promise.all(
          mapObj.map((Element) => {
            let temp = emailBody.template;

            for (i in Element) {
              if (temp.includes(i)) {
                temp = replace(temp, i, Element[i]);
              }
            }
            const emailData = new Mailer({
              to: [Element["email"]],
              from: emailBody.from,
              subject: emailBody.subject,
              html: temp,
              attachments: emailBody.attachments,
            });
            emailData.sendMail();
          })
        )
          .then((resp) => {
            let emailDetail = new all_temp(emailBody);
            emailDetail.save((err, emailSave) => {
              if (err) {
                res.send({ msg: err, success: false });
              } else {
                all_temp
                  .findByIdAndUpdate(emailSave._id, {
                    is_Sent: true,
                    email_type: "sent",
                  })
                  .exec((err, emailUpdate) => {
                    if (err) {
                      res.send({ msg: err, success: false });
                    } else {
                      return res.send({
                        msg: "Email Sent Successfully",
                        success: true,
                      });
                    }
                  });
              }
            });
          })
          .catch((Err) => {
            res.sen({ msg: Err, success: false });
          });
      } else {
        const emailData = new Mailer({
          to: emailBody.to,
          from: emailBody.from,
          subject: emailBody.subject,
          html: emailBody.template,
          attachments: attachments,
        });
        emailData
          .sendMail()
          .then((resp) => {
            let emailDetail = new all_temp(emailBody);
            emailDetail.save((err, emailSave) => {
              if (err) {
                return res.send({ msg: err, success: false });
              } else {
                all_temp
                  .findByIdAndUpdate(emailSave._id, {
                    is_Sent: true,
                    email_type: "sent",
                  })
                  .exec((err, emailUpdate) => {
                    if (err) {
                      return res.send({ msg: err, success: false });
                    }
                    return res.send({
                      msg: "Email Sent Successfully",
                      success: true,
                    });
                  });
              }
            });
          })
          .catch((Err) => {
            res.send({ msg: Err, success: false });
          });
      }
    } else {
      if (!JSON.parse(emailBody.immediately)) {
        if (!emailBody.to) {
          emailBody.smartLists = emailBody.smartLists
            ? JSON.parse(emailBody.smartLists)
            : [];
        }
        let sent_date = moment(emailBody.sent_date).format("YYYY-MM-DD");
        emailBody.is_Sent = false;
        emailBody.email_type = "scheduled";
        let emailDetail = new all_temp(emailBody);
        emailDetail.save((err, emailSave) => {
          if (err) {
            res.send({ msg: err, success: false });
          } else {
            return res.send({
              msg: `Email Successfully! Scheduled on ${sent_date} At ${emailBody.sent_time} `,
              success: true,
            });
          }
        });
      }
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

function replace(strig, old_word, new_word) {
  return strig.replace(new RegExp(`{${old_word}}`, "g"), new_word);
}
exports.admin_add_template = async (req, res) => {
  try {
    let userId = req.params.userId;
    let adminId = req.params.adminId;
    let folderId = req.params.folderId;

    let {
      to,
      from,
      subject,
      template,
      sent_time,
      sent_date,
      smartLists,
      design,
      days_type,
      content_type,
      days,
      createdBy,
      immediately,
      isPlaceHolders,
    } = req.body;
    if (!to) {
      smartLists = smartLists ? JSON.parse(smartLists) : [];
    } else {
      to = JSON.parse(to);
    }

    const obj = {
      to,
      from,
      subject,
      template,
      sent_date,
      sent_time,
      design,
      days,
      days_type,
      content_type,
      category: "compose",
      userId,
      adminId,
      folderId,
      smartLists,
      createdBy,
      immediately,
      isPlaceHolders,
    };
    let attachments = [];
    if (req.files) {
      req.files.map((file) => {
        let content = new Buffer.from(file.buffer, "utf-8");
        let attach = {
          content: content,
          filename: file.originalname,
          type: `application/${file.mimetype.split("/")[1]}`,
          disposition: "attachment",
        };
        attachments.push(attach);
      });
    }
    const resolvAttachments = await Promise.all(attachments);
    obj.attachments = resolvAttachments;
    saveEmailTemplate(obj)
      .then((data) => {
        compose_folder.findByIdAndUpdate(
          folderId,
          { $push: { template: data._id } },
          (err, data) => {
            if (err) {
              return res.send({ msg: err, success: false });
            }
            return res.send({
              msg: "Template saved Successfully!",
              success: true,
            });
          }
        );
      })
      .catch((err) => {
        return res.send({
          success: false,
          msg: err,
        });
      });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.activate_mail = async (req, res) => {
  const userId = req.params.userId;
  const tempId = req.body.tempId;

  if (req.body.isActive) {
    all_temp.updateOne(
      { _id: { $in: tempId } },
      { $pull: { inActiveUsers: userId } },
      (err, resp) => {
        if (err) {
          res.json({ success: false, msg: "mail activation failed!" });
        } else {
          res.json({
            success: true,
            msg: "mail activated successfully",
          });
        }
      }
    );
  } else {
    all_temp.updateMany(
      { _id: { $in: tempId } },
      { $push: { inActiveUsers: userId } },
      (err, resp) => {
        if (err) {
          res.json({ success: false, msg: "mail deactivation failed!" });
        } else {
          res.json({
            success: true,
            msg: "mail deactivated successfully",
          });
        }
      }
    );
  }
};

exports.add_template = async (req, res) => {
  try {
    let userId = req.params.userId;
    let adminId = req.params.adminId;
    let folderId = req.params.folderId;

    let {
      to,
      from,
      subject,
      template,
      sent_time,
      sent_date,
      smartLists,
      design,
      days_type,
      content_type,
      days,
      createdBy,
      isPlaceHolders,
    } = req.body;
    if (!to) {
      smartLists = smartLists ? JSON.parse(smartLists) : [];
      smartLists = smartLists.map((s) => ObjectId(s));
      let smartlists = await smartlist.aggregate([
        { $match: { _id: { $in: smartLists } } },
        { $project: { criteria: 1, _id: 0 } },
      ]);
      let promises = [];
      smartlists.forEach((element, index) => {
        promises.push(filterSmartlist(element.criteria, userId));
      });
      let data = await Promise.all(promises);
      data = [].concat.apply([], data);
      let mapObj = await students.find(
        {
          _id: { $in: data },
          userId: userId,
          email: { $nin: [undefined, ""] },
        },
        { email: 1, _id: 0 }
      );

      let rest = [...new Set(mapObj.map((element) => element.email))];
      if (!rest.length) {
        return res.send({
          msg: `No Smartlist exist!`,
          success: false,
        });
      }
      to = rest;
    } else {
      to = JSON.parse(to);
    }

    const obj = {
      to,
      from,
      subject,
      template,
      sent_date,
      sent_time,
      design,
      days,
      days_type,
      content_type,
      category: "compose",
      userId,
      adminId,
      folderId,
      smartLists,
      createdBy,
      isPlaceHolders,
    };
    let attachments = [];
    if (req.files) {
      req.files.map((file) => {
        let content = new Buffer.from(file.buffer, "utf-8");
        let attach = {
          content: content,
          filename: file.originalname,
          type: `application/${file.mimetype.split("/")[1]}`,
          disposition: "attachment",
        };
        attachments.push(attach);
      });
    }
    const resolvAttachments = await Promise.all(attachments);
    obj.attachments = resolvAttachments;
    saveEmailTemplate(obj)
      .then((data) => {
        compose_folder.findByIdAndUpdate(
          folderId,
          { $push: { template: data._id } },
          (err, data) => {
            if (err) {
              return res.send({ msg: err, success: false });
            }
            return res.send({
              msg: "Template saved Successfully!",
              success: true,
            });
          }
        );
      })
      .catch((err) => {
        return res.send({
          success: false,
          msg: err,
        });
      });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

function saveEmailTemplate(obj) {
  return new Promise((resolve, reject) => {
    let emailDetail = new template(obj);
    emailDetail.save((err, data) => {
      if (err) {
        reject({ data: "Data not save in Database!", success: err });
      } else {
        resolve(data);
      }
    });
  });
}


exports.remove_template = (req, res) => {
  template.findByIdAndRemove(req.params.templateId, (err, removeTemplate) => {
    if (err) {
      res.send({ error: "compose template is not remove" });
    } else {
      compose_folder.updateOne(
        { template: removeTemplate._id },
        { $pull: { template: removeTemplate._id } },
        function (err, temp) {
          if (err) {
            res.send({
              msg: "Template not removed!",
              success: false,
            });
          } else {
            res.send({ msg: "Template removed successfully", success: true });
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
      promises.push(template.remove({ _id: id }));
      compose_folder
        .updateOne({ _id: folderId }, { $pull: { template: ObjectId(id) } })
        .then((err, res) => {
          if (err) {
            throw new Error("folder not updated");
          }
        });
    }
    Promise.all(promises);
    res.send({
      msg: "Successfuly Removed Templates",
      success: true,
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.criteria_met = async (req, res) => {
  let userId = req.params.userId;
  let folderId = req.params.folderId;
  try {
    const {
      to,
      from,
      subject,
      template,
      sent_time,
      sent_date,
      smartLists,
      days,
    } = req.body;
    const obj = {
      to,
      from,
      subject,
      template,
      sent_date,
      sent_time,
      email_type: "scheduled",
      email_status: true,
      category: "nurturing",
      userId,
      folderId,
      smartLists,
      days,
    };
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
          msg: er,
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
  } catch (err) {
    throw new Error(err);
  }
};

var emailCronFucntionalityfor30DaysBirthday = async () => {
  let promises = [];

  let scheduledListing = await all_temp.find({
    category: "nurturing",
    is_Sent: false,
  });

  scheduledListing.forEach(async (ele) => {
    let days = ele.days;
    let dayofMonth = parseInt(
      moment(new Date()).add(days, "days").format("DD")
    );
    let Month = parseInt(moment(new Date()).add(days, "days").format("MM"));
    let objectIdArray = ele.smartLists.map((s) => mongoose.Types.ObjectId(s));
    let scheduleData = await students.aggregate([
      {
        $match: {
          _id: { $in: objectIdArray },
        },
      },
      {
        $project: {
          email: 1,
          dob: 1,
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $month: "$dob" }, Month] },
              { $eq: [{ $dayOfMonth: "$dob" }, dayofMonth] },
            ],
          },
        },
      },
    ]);
    if (scheduleData.length) {
      scheduleData.map((i) => {
        const emailData = new Mailer({
          sendgrid_key: process.env.SENDGRID_API_KEY,
          to: i.email,
          from: ele.from,
          subject: ele.subject,
          content: ele.template,
        });
        emailData
          .sendMail()
          .then(async (resp) => {
            try {
              await all_temp.findOneAndUpdate(
                { _id: ele._id },
                { $set: { is_Sent: true } }
              );
            } catch (err) {
              throw new Error("Mail status not updated", err);
            }
          })
          .catch((err) => {
            throw new Error(err);
          });
      });
    }
    {
      console.warn("no Email scheduled for this crone !");
    }
  });
  await Promise.all(promises);
};

// cron.schedule("0 0 * * *", () => emailCronFucntionalityfor30DaysBirthday())

function removeEmptyString(arr) {
  return arr.filter((v) => v != "");
}
