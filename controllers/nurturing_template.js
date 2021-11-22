const all_temp = require("../models/emailSentSave");
const nurturingFolderModal = require("../models/email_nurturing_folder");
const key = require("../models/email_key");
const moment = require("moment");
const async = require("async");
const sgMail = require("sendgrid-v3-node");
const cron = require("node-cron");
const folderNur = require("../models/email_nurturing_folder");
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

exports.list_template = (req, res) => {
  nurturingFolderModal
    .findById(req.params.folderId)
    .populate({
      path: "template",
      match: { is_Sent: false, email_type: "schedule" },
      options: { sort: { templete_Id: 1 } },
    })
    .exec((err, template_data) => {
      if (err) {
        res.send({ error: "nurturing template list not found" });
      } else {
        res.send(template_data);
      }
    });
};

exports.add_template = async (req, res) => {
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
  } = req.body || {};
  let { userId, folderId } = req.params || {};

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
    category: "nurturing",
    userId,
    folderId,
    templete_Id,
  };

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
        nurturingFolderModal
          .findByIdAndUpdate(folderId, { $push: { template: data._id } })
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
// exports.add_template = (req,res)=>{
//             if(req.body.follow_up === 0){
//                 var date_iso = timefun(req.body.sent_date,req.body.sent_time)

//                           var obj = {
//                               to: req.body.to,
//                               from: req.body.from,
//                               title:req.body.title,
//                               subject:req.body.subject,
//                               template:req.body.template,
//                               sent_date: req.body.sent_date,
//                               sent_time: req.body.sent_time,
//                               DateT:date_iso,
//                               repeat_mail: req.body.repeat_mail,
//                               follow_up: req.body.follow_up,
//                               email_type:'schedule',
//                               email_status:true,
//                               category:'nurturing',
//                               userId:req.params.userId,
//                               folderId:req.params.folderId
//                           }
//                       }

//                       else if(req.body.follow_up > 0){
//                         var date_iso_follow = timefun(req.body.sent_date,req.body.sent_time)

//                         date_iso_follow.setDate(date_iso_follow.getDate() + req.body.follow_up);
//                         var mdy = moment(date_iso_follow).format('MM/DD/YYYY')
//

//                         var obj = {
//                             to: req.body.to,
//                             from: req.body.from,
//                             title:req.body.title,
//                             subject:req.body.subject,
//                             template:req.body.template,
//                             sent_date: mdy,
//                             sent_time: req.body.sent_time,
//                             DateT:date_iso_follow,
//                             repeat_mail: req.body.repeat_mail,
//                             follow_up: req.body.follow_up,
//                             email_type:'schedule',
//                             email_status:true,
//                             category:'nurturing',
//                             userId:req.params.userId,
//                             folderId:req.params.folderId
//                         }
//                     }
//                     else if(req.body.follow_up < 0){
//                         res.send({code:400,msg:'follow up not set less then 0'})
//                     }

//                 var emailDetail =  new template(obj)
//                 emailDetail.save((err,emailSave)=>{
//            if(err){
//               res.send({code:200,msg:'template not save'})
//           }
//           else{
//             nurturing_folder.findByIdAndUpdate(req.params.folderId,{$push:{template:emailSave._id}})
//             .exec((err,template)=>{
//                 if(err){
//                     res.send({code:400,msg:'nurturing template details is not add in folder'})
//                 }
//                 else{
//                     res.send({code:200,msg:'nurturing template details is add in folder',result:emailSave})
//                 }
//             })
//           }
//       })

// }

exports.remove_template = (req, res) => {
  all_temp.findByIdAndRemove(req.params.templateId, (err, removeTemplate) => {
    if (err) {
      res.send({ error: "nurturing template is not remove" });
    } else {
      nurturingFolderModal.update(
        { template: removeTemplate._id },
        { $pull: { template: removeTemplate._id } },
        function (err, temp) {
          if (err) {
            res.send({
              error: "nurturing template details is not remove in folder",
            });
          } else {
            res.send({ msg: "nurturing template is remove successfully" });
          }
        }
      );
    }
  });
};

exports.all_email_list = async (req, res) => {
  all_temp.find({ userId: req.params.userId }).exec((err, allTemp) => {
    if (err) {
      res.send({ code: 400, msg: "email list not found" });
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

exports.update_template = (req, res) => {
  all_temp.update(
    { _id: req.params.templateId },
    req.body,
    (err, updateTemp) => {
      if (err) {
        res.send({ error: "template is not update" });
      } else {
        res.send({ message: "updated successfully", success: true });
      }
    }
  );
};

//single temp update status
exports.single_tem_update_status = (req, res) => {
  if (req.body.email_status == true) {
    all_temp.updateOne(
      { _id: req.params.tempId },
      { $set: { email_status: true } },
      (err, resp) => {
        if (err) {
          res.json({ code: 400, msg: "email nurturing status not deactive" });
        } else {
          res.json({
            code: 200,
            msg: "email nurturing status active successfully",
          });
        }
      }
    );
  } else if (req.body.email_status == false) {
    all_temp.updateOne(
      { _id: req.params.tempId },
      { $set: { email_status: false } },
      (err, resp) => {
        if (err) {
          res.json({ code: 400, msg: "email nurturing status not active" });
        } else {
          res.json({
            code: 200,
            msg: "email nurturing status deactive successfully",
          });
        }
      }
    );
  }
};

//update status of all template
exports.status_update_template = (req, res) => {
  if (req.body.status == "false") {
    all_temp
      .find({
        $and: [
          { userId: req.params.userId },
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
  } else if (req.body.status == "true") {
    all_temp
      .find({
        $and: [
          { userId: req.params.userId },
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

exports.multipal_temp_remove = (req, res) => {
  let folderId = req.params.folderId;
  let templateIds = req.body.templateId;
  all_temp.remove({ _id: { $in: templateIds } }).exec((err, resp) => {
    if (err) {
      res.json({ code: 400, msg: "templates not remove" });
    } else {
      for (let id of templateIds) {
        folderNur.updateOne(
          { _id: folderId },
          { $pull: { template: ObjectId(id) } }
        ).then( (err, res) => {
          if(err){
            throw new Error(err);
          }
        })
      }
      res.json({ success:true, msg: "template is remove successfully" });
    }
  });
};
