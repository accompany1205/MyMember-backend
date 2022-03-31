const addTemp = require("../models/emailSentSave");
const Template = require('../models/emailTemplates')
const students = require("../models/addmember");
const smartlist = require("../models/smartlists");
const systemFolder = require("../models/email_system_folder");
const user = require("../models/user");
const async = require("async");
moment = require("moment");
const cron = require("node-cron");
const Mailer = require("../helpers/Mailer");
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const cloudUrl = require("../gcloud/imageUrl");
const ObjectId = require("mongodb").ObjectId;
const { filterSmartlist } = require('../controllers/smartlists')

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

// exports.add_template = async (req, res) => {
//   const counts = await addTemp
//     .find({ folderId: req.params.folderId })
//     .countDocuments();
//   let templete_Id = counts + 1;

//   try {
//     let adminId = req.params.adminId;
//     let userData = await user.findById(adminId);
//     if (userData.role === 1) {
//       var obj = {
//         title: req.body.title,
//         subject: req.body.subject,
//         template: req.body.template,
//         email_type: "schedule",
//         category: "system",
//         createdBy: "admin",
//         email_status: true,
//         adminId: adminId,
//         folderId: req.params.folderId,
//         templete_Id,
//       };

//       var emailDetail = new addTemp(obj);
//       emailDetail.save((err, emailSave) => {
//         if (err) {
//           res.send(err);
//         } else {
//           systemFolder
//             .findByIdAndUpdate(req.params.folderId, {
//               $push: { template: emailSave._id },
//             })
//             .exec((err) => {
//               if (err) {
//                 res.send({
//                   Error: "system template details is not add in folder",
//                   error: err,
//                 });
//               } else {
//                 res.send({
//                   msg: "system template details is add in folder",
//                   result: emailSave,
//                 });
//               }
//             });
//         }
//       });
//     } else {
//       res.json({
//         msg: "not an Admin, not authorized to create sys template.",
//         success: false,
//         code: 403,
//       });
//     }
//   } catch (error) {
//     throw new Error(error)
//   }
// };
exports.admin_add_template = async (req, res) => {
  try {
    let adminId = req.params.adminId;
    let folderId = req.params.folderId;
    let {
      to,
      from,
      subject,
      template,
      design,
      days_type,
      immediately,
      content_type,
      smartLists,
      createdBy,
      isPlaceHolders
    } = req.body || {};
    if (!to) {
      smartLists = smartLists ? JSON.parse(smartLists) : []

    }
    else {
      to = JSON.parse(to);
    }
    const obj = {
      to,
      from,
      subject,
      template,
      design,
      days_type,
      content_type,
      email_type: "scheduled",
      category: "system",
      folderId,
      smartLists,
      createdBy,
      adminId,
      immediately,
      isPlaceHolders
    };
    // const promises = []
    // if (req.files) {
    //   (req.files).map(file => {
    //     promises.push(cloudUrl.imageUrl(file))
    //   });
    //   var attachments = await Promise.all(promises);
    // }
    // obj.attachments = attachments
    let attachments = []
    if (req.files) {
      (req.files).map((file) => {
        let content = new Buffer.from(file.buffer, "utf-8")
        let attach = {
          content: content,
          filename: file.originalname,
          type: `application/${file.mimetype.split("/")[1]}`,
          disposition: "attachment"
        }
        attachments.push(attach)

      })
    }
    const Allattachments = await Promise.all(attachments);
    obj.attachments = Allattachments;
    if (JSON.parse(immediately)) {
      const emailData = new Mailer({
        to,
        from,
        subject,
        html: template,
        attachments: Allattachments
      })

      emailData.sendMail()
        .then(resp => {
          saveEmailTemplate(obj)
            .then((data) => {
              systemFolder
                .findByIdAndUpdate(folderId, { $push: { template: data._id } }, (err, data) => {
                  if (err) {
                    res.send({ msg: err, success: false })
                  }
                  res.send({ msg: "Email send Successfully!", success: true })

                })
            })
            .catch((ex) => {
              res.send({
                success: false,
                msg: ex
              });
            });
        })
        .catch(err => {
          res.send({ error: err.message.replace(/\"/g, ""), success: false })
        })

    } else if (!JSON.parse(immediately)) {
      saveEmailTemplate(obj)
        .then((data) => {
          systemFolder
            .findByIdAndUpdate(folderId, { $push: { template: data._id } })
            .then((data) => {
              res.send({
                msg: `Template created Successfully`,
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
            msg: ex
          });
        });
    }
    else {
      res.send({ msg: 'something went wrong', success: false })

    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }

};
function replace(strig, old_word, new_word) {
  return strig.replace('{' + old_word + '}', new_word)

}

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
      design,
      days,
      days_type,
      immediately,
      content_type,
      smartLists,
      createdBy,
      isPlaceHolders
    } = req.body || {};
    if (days && days_type != 'before') {
      sent_date = moment().add(days, 'days').format("YYYY-MM-DD");
    } else {
      sent_date = moment(sent_date).format("YYYY-MM-DD");

    }
    if (!to) {
      smartLists = smartLists ? JSON.parse(smartLists) : []
      smartLists = smartLists.map(s => ObjectId(s));
      let smartlists = await smartlist.aggregate([
        { $match: { _id: { $in: smartLists } } },
        { $project: { criteria: 1, _id: 0 } }
      ])
      let promises = [];
      smartlists.forEach((element, index) => {
        promises.push(filterSmartlist(element.criteria, userId))
      })
      let data = await Promise.all(promises)
     var rest = data.reduce(function (a, b) {
        return b.map(function (e, i) { return a[i] instanceof Object ? a[i] : e; });
      }, []);
      if (!rest.length) {
        return res.send({
          msg: `No Smartlist exist!`,
          success: false,
        });
      }
      to = rest;

    }
    else {
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
      email_type: "scheduled",
      category: "system",
      userId,
      folderId,
      smartLists,
      createdBy,
      adminId,
      isPlaceHolders
    };

    // const promises = []
    // if (req.files) {
    //   (req.files).map(file => {
    //     promises.push(cloudUrl.imageUrl(file))
    //   });
    //   var attachments = await Promise.all(promises);
    // }
    // obj.attachments = attachments
    let attachments = []
    if (req.files) {
      (req.files).map((file) => {
        let content = new Buffer.from(file.buffer, "utf-8")
        let attach = {
          content: content,
          filename: file.originalname,
          type: `application/${file.mimetype.split("/")[1]}`,
          disposition: "attachment"
        }
        attachments.push(attach)

      })
    }
    const Allattachments = await Promise.all(attachments);
    obj.attachments = Allattachments;
    if (JSON.parse(immediately)) {
      if (JSON.parse(isPlaceHolders)) {
        let mapObj = await students.find({
          email: { $in: rest },
          userId: userId
        })

        mapObj = mapObj ? mapObj : []
        if (!mapObj.length) {
          return res.send({
            msg: `No Smartlist exist!`,
            success: false,
          });
        }

        Promise.all(mapObj.map(Element => {
          let temp = template;

          for (i in Element) {
            if (temp.includes(i)) {
              temp = replace(temp, i, Element[i])
            }
          }
          const emailData = new Mailer({
            to: [Element["email"]],
            from: from,
            subject: subject,
            html: temp,
            attachments: Allattachments
          });
          emailData.sendMail()
        }))
          .then(resp => {
            saveEmailTemplate(obj)
              .then((data) => {
                systemFolder
                  .findByIdAndUpdate(folderId, { $push: { template: data._id } }, (err, data) => {
                    if (err) {
                      res.send({ msg: err, success: false })
                    }
                    res.send({ msg: "Email send Successfully!", success: true })

                  })
              })
              .catch((ex) => {
                res.send({
                  success: false,
                  msg: ex
                });
              });
          })
          .catch(err => {
            res.send({ error: err.message.replace(/\"/g, ""), success: false })
          })
      }
      const emailData = new Mailer({
        to,
        from,
        subject,
        html: template,
        attachments: Allattachments
      })

      emailData.sendMail()
        .then(resp => {
          obj.email_type = 'sent'
          obj.is_Sent = true
          saveEmailTemplate(obj)
            .then((data) => {
              systemFolder
                .findByIdAndUpdate(folderId, { $push: { template: data._id } }, (err, data) => {
                  if (err) {
                    res.send({ msg: err, success: false })
                  }
                  res.send({ msg: "Email send Successfully!", success: true })

                })
            })
            .catch((ex) => {
              res.send({
                success: false,
                msg: ex
              });
            });
        })
        .catch(err => {
          res.send({ error: err.message.replace(/\"/g, ""), success: false })
        })

    } else if (!JSON.parse(immediately) && days) {
      saveEmailTemplate(obj)
        .then((data) => {
          systemFolder
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
            msg: ex
          });
        });
    }
    else {
      res.send({ msg: 'something went wrong', success: false })

    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }

};

function saveEmailTemplate(obj) {
  return new Promise((resolve, reject) => {
    let emailDetail = new addTemp(obj);
    emailDetail.save((err, data) => {
      if (err) {
        reject({ data: "Data not save in Database!", success: err });
      } else {
        resolve(data);
      }
    });
  });
}

exports.update_template = async (req, res) => {
  let updateTemplate = req.body;
  let smartList = updateTemplate.smartLists;
  let to = updateTemplate.to
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
  updateTemplate.to = to
  updateTemplate.smartList = smartList
  const promises = []
  if (req.files) {
    (req.files).map(file => {
      promises.push(cloudUrl.imageUrl(file))
    });
    var allAttachments = await Promise.all(promises);
    updateTemplate.attachments = allAttachments;
  }
  addTemp.updateOne(
    { _id: req.params.templateId },
    updateTemplate,
    (err, updateTemp) => {
      if (err) {
        res.send({ msg: "template is not update", success: err });
      } else {
        res.send({ msg: "updated successfully", success: true });
      }
    }
  );
};

// exports.update_template = async (req, res) => {
//   let { to, from, sent_time, repeat_mail, sent_date, follow_up, smartLists } =
//     req.body || {};
//   let { adminId, templateId } = req.params || {};
//   to = JSON.parse(to);
//   smartLists = JSON.parse(smartLists);
//   if(!to && !smartLists){
//     throw new Error("Select atleat send-to or smart-List")
//   }
//   if (to && smartLists) {
//     throw new Error("Either select send-To or smart-list")
//   }
//   if (!to) {
//     smartLists.map(lists => {
//       to = [...to, ...lists.smrtList]
//     });
//   }
//   let obj = {
//     to,
//     from,
//     sent_time,
//     DateT: date_iso_follow,
//     sent_date,
//     repeat_mail,
//     follow_up,
//     email_type: "schedule",
//     email_status: true,
//     category: "system",
//     attachments,
//     smartLists
//   };
//   const promises = []
//   if (req.files) {
//     (req.files).map(file => {
//       promises.push(cloudUrl.imageUrl(file))
//     });
//     var attachments = await Promise.all(promises);
//     obj.attachments = attachments;
//   }
//   //let userData = await user.findById(adminId);
//   if (req.body.follow_up === 0) {
//     var date_iso = timefun(req.body.sent_date, req.body.sent_time);
//     obj.DateT = date_iso;
//   } else if (req.body.follow_up < 0) {
//     res.send({ code: 400, msg: "follow up not set less then 0" });
//   } else {
//     var date_iso_follow = timefun(req.body.sent_date, req.body.sent_time);
//     date_iso_follow.setDate(date_iso_follow.getDate() + req.body.follow_up);
//     var nD = moment(date_iso_follow).format("MM/DD/YYYY");
//     addTemp.findByIdAndUpdate(templateId, obj, (err, updateTemp) => {
//       if (err) {
//         res.send({ success:false,code: 400, msg: "template is not update" });
//       } else {
//        res.send({success:true, code: 200, msg:"schedulded succesfully"})
//       }
//     });
//   }

// };

exports.remove_template = (req, res) => {
  addTemp.findByIdAndRemove(req.params.templateId, (err, removeTemplate) => {
    if (err) {
      res.send({ msg: "system template is not remove", success: true });
    } else {
      systemFolder.updateOne(
        { template: removeTemplate._id },
        { $pull: { template: removeTemplate._id } },
        function (err, temp) {
          if (err) {
            res.send({
              msg: "Template not removed", success: false
            });
          } else {
            res.send({ msg: "Template removed successfully", success: true });
          }
        }
      );
    }
  });
};

exports.status_update_template = (req, res) => {
  if (req.body.is_Favorite == false) {
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

exports.single_temp_update_status = (req, res) => {
  if (req.body.is_Favorite) {
    addTemp.updateOne(
      { _id: req.params.tempId },
      { $set: { is_Favorite: true } },
      (err, resp) => {
        if (err) {
          res.json({ success: false, msg: "email status not deactive" });
        } else {
          res.json({ success: true, msg: "Template marked as stared successfully" });
        }
      }
    );
  } else {
    addTemp.updateOne(
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
  template.remove({ _id: { $in: templateIds } }).exec((err, resp) => {
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
