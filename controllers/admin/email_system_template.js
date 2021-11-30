const addTemp = require("../../models/emailSentSave");
const systemFolder = require("../../models/email_system_folder");
const user = require("../../models/user");
const async = require("async");
moment = require("moment");
const cron = require("node-cron");
const sgMail = require("sendgrid-v3-node");
const cloudUrl = require("../../gcloud/imageUrl");
const ObjectId = require("mongodb").ObjectId;

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

exports.list_template = (req, res) => {
  systemFolder
    .findById(req.params.folderId)
    .populate({
      path: "template",
      match: { is_Sent: false, email_type: "schedule" },
      options: { sort: { templete_Id: 1 } },
    })
    .exec((err, template_data) => {
      if (err) {
        res.send({ error: "template list not found" });
      } else {
        res.send(template_data);
      }
    });
};

exports.add_template = async (req, res) => {
  const counts = await addTemp
    .find({ folderId: req.params.folderId })
    .countDocuments();
  let templete_Id = counts + 1;

  try {
    let adminId = req.params.adminId;
    let userData = await user.findById(adminId);
    if (userData.role === 1) {
      var obj = {
        title: req.body.title,
        subject: req.body.subject,
        template: req.body.template,
        email_type: "schedule",
        category: "system",
        createdBy: "admin",
        email_status: true,
        adminId: adminId,
        folderId: req.params.folderId,
        templete_Id,
      };

      var emailDetail = new addTemp(obj);
      emailDetail.save((err, emailSave) => {
        if (err) {
          res.send(err);
        } else {
          systemFolder
            .findByIdAndUpdate(req.params.folderId, {
              $push: { template: emailSave._id },
            })
            .exec((err) => {
              if (err) {
                res.send({
                  Error: "system template details is not add in folder",
                  error: err,
                });
              } else {
                res.send({
                  msg: "system template details is add in folder",
                  result: emailSave,
                });
              }
            });
        }
      });
    } else {
      res.json({
        msg: "not an Admin, not authorized to create sys template.",
        success: false,
        code: 403,
      });
    }
  } catch (error) {
    throw new Error(error)
  }
};

exports.update_template = async (req, res) => {
  let { to, from, sent_time, repeat_mail, sent_date, follow_up, smartLists } =
    req.body || {};
  let { adminId, templateId } = req.params || {};
  to = JSON.parse(to);
  smartLists = JSON.parse(smartLists);
  if(!to && !smartLists){
    throw new Error("Select atleat send-to or smart-List")
  }
  if (to && smartLists) {
    throw new Error("Either select send-To or smart-list")
  }
  if (!to) {
    smartLists.map(lists => {
      to = [...to, ...lists.smrtList]
    });
  }
  let obj = {
    to,
    from,
    sent_time,
    DateT: date_iso_follow,
    sent_date,
    repeat_mail,
    follow_up,
    email_type: "schedule",
    email_status: true,
    category: "system",
    attachments,
    smartLists
  };
  const promises = []
  if (req.files) {
    (req.files).map(file => {
      promises.push(cloudUrl.imageUrl(file))
    });
    var attachments = await Promise.all(promises);
    obj.attachments = attachments;
  }
  //let userData = await user.findById(adminId);
  if (req.body.follow_up === 0) {
    var date_iso = timefun(req.body.sent_date, req.body.sent_time);
    obj.DateT = date_iso;
  } else if (req.body.follow_up < 0) {
    res.send({ code: 400, msg: "follow up not set less then 0" });
  } else {
    var date_iso_follow = timefun(req.body.sent_date, req.body.sent_time);
    date_iso_follow.setDate(date_iso_follow.getDate() + req.body.follow_up);
    var nD = moment(date_iso_follow).format("MM/DD/YYYY");
    addTemp.findByIdAndUpdate(templateId, obj, (err, updateTemp) => {
      if (err) {
        res.send({ success:false,code: 400, msg: "template is not update" });
      } else {
       res.send({success:true, code: 200, msg:"schedulded succesfully"})
      }
    });
  }

};

exports.remove_template = (req, res) => {
  addTemp.findByIdAndRemove(req.params.templateId, (err, removeTemplate) => {
    if (err) {
      res.send({ error: "system template is not remove" });
    } else {
      systemFolder.update(
        { template: removeTemplate._id },
        { $pull: { template: removeTemplate._id } },
        function (err, temp) {
          if (err) {
            res.send({
              error: "system template details is not remove in folder",
            });
          } else {
            res.send({ msg: "system template is remove successfully" });
          }
        }
      );
    }
  });
};

exports.status_update_template = (req, res) => {
  if (req.body.status == false) {
    addTemp
      .find({
        $and: [
          { adminId: req.params.adminId },
          { folderId: req.params.folderId },
        ],
      })
      .exec((err, TempData) => {
        if (err) {
          res.send(err);
        } else {
          async.eachSeries(
            TempData,
            (obj, done) => {
              addTemp.findByIdAndUpdate(
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
  } else if (req.body.status == true) {
    addTemp
      .find({
        $and: [
          { adminId: req.params.adminId },
          { folderId: req.params.folderId },
        ],
      })
      .exec((err, TempData) => {
        if (err) {
          res.send(err);
        } else {
          async.eachSeries(
            TempData,
            (obj, done) => {
              addTemp.findByIdAndUpdate(
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

exports.single_temp_update_status = (req, res) => {
  if (req.body.email_status == true) {
    addTemp.updateOne(
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
    addTemp.updateOne(
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

exports.swapAndUpdate_template = async (req, res) => {
  if (req.body.length < 1) {
    res.send({ message: "invalid input" });
  } else {
    const updateTO = req.body.updateTo;
    const ObjectIdOfupdateTo = req.body.ObjectIdOfupdateTo;
    const updateFrom = req.body.updateFrom;
    const ObjectIdOfupdateFrom = req.body.ObjectIdOfupdateFrom;
    const first = await addTemp.findByIdAndUpdate(ObjectIdOfupdateTo, {
      templete_Id: updateFrom,
    });
    const second = await addTemp
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

exports.multipal_temp_remove = (req, res) => {
  let folderId = req.params.folderId;
  let templateIds = req.body.templateId;
  addTemp.remove({ _id: { $in: templateIds } }).exec((err, resp) => {
    if (err) {
      res.json({ code: 400, msg: "templates not remove" });
    } else {
      for (let id of templateIds) {
        systemFolder.updateOne(
          { _id: folderId },
          { $pull: { template: ObjectId(id) } }
        ).then((err, res) => {
          if (err) {
            throw new Error(err);
          }
        })
      }
      res.json({ success: true, msg: "template is remove successfully" });
    }
  });
}
