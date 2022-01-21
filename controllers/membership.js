const membershipModal = require("../models/membership");
const membershipFolder = require("../models/membershipFolder");
const cloudUrl = require("../gcloud/imageUrl");
const Student = require("../models/addmember");
const jszip = require('jszip');
const axios = require('axios');
let fs = require('fs')

const Docxtemplater = require("docxtemplater");

exports.create = async (req, res) => {
  try {
    const membershipDetails = await req.body;
    membershipDetails.userId = req.params.userId;
    membershipDetails.adminId = req.params.adminId;
    membershipDetails.folderId = req.params.folderId;
    const promises = []
    if (req.files) {
      (req.files).map(file => {
        if (file.originalname.split('.')[0] === "thumbnail") {
          cloudUrl.imageUrl(file)
            .then(data => {
              membershipDetails.membershipThumbnail = data
            })
            .catch(err => {
              res.send({ msg: "Thumbnail not uploaded!", success: false })
            })
        } else {
          promises.push(cloudUrl.imageUrl(file))
        }
      });
      var docs = await Promise.all(promises);
    }
    membershipDetails.membershipDoc = docs;
    const membershipObj = new membershipModal(membershipDetails);
    await membershipObj.save((err, data) => {
      if (err) {
        res.send({ msg: "Membership not created", success: false });
      } else {
        membershipFolder.findByIdAndUpdate(
          req.params.folderId,
          {
            $push: { membership: data._id },
          },
          (err, data) => {
            if (err) {
              res.send({
                msg: "Membership not added in folder",
                success: false,
              });
            } else {
              res.send({ msg: "membership created successfully", success: true });
            }
          }
        );
      }
    });
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ""), success: false });
  }
};

exports.read = (req, res) => {
  const userId = req.params.userId
  const adminId = req.params.adminId
  membershipModal.find({ $and: [{ userId: { $in: [userId] } }, { adminId: adminId }] }).exec((err, data) => {
    if (err) {
      res.send({ error: "membership list is not find" });
    } else {
      res.send({ data, success: true });
    }
  });
};

exports.membershipInfo = (req, res) => {
  var membershipId = req.params.membershipId;
  membershipModal.findById(membershipId).exec((err, data) => {
    if (err) {
      res.send({ msg: "membership  not found", success: false });
    } else {
      res.send({ data, success: true });
    }
  });
};

exports.remove = (req, res) => {
  const membershipId = req.params.membershipId;
  const adminId = req.params.adminId
  const userId = req.params.userId;
  try {
    membershipModal.findOneAndRemove(
      { _id: membershipId, $and: [{ userId: userId }, { adminId: adminId }] },
      (err, data) => {
        if (err) {
          res.send({ msg: "membership is not delete", success: false });
        } else {
          if (!data) {
            return res.send({
              msg: "This is system generated membership Only admin can delete",
              success: false,
            });
          }
          membershipFolder.updateOne(
            { membership: data._id },
            { $pull: { membership: data._id } },
            function (err, temp) {
              if (err) {
                res.send({
                  error: "membership not removed",
                  success: false,
                });
              } else {
                res.send({
                  msg: "membership removed successfully",
                  success: true,
                });
              }
            }
          );
        }
      });
  } catch (er) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
};

exports.membershipUpdate = async (req, res) => {
  try {

    var membershipData = req.body;
    const membershipId = req.params.membershipId;
    const adminId = req.params.adminId
    const userId = req.params.userId;
    const new_folderId = req.body.folderId;
    const old_folderId = req.body.old_folderId;
    const promises = []
    if (req.files) {
      (req.files).map(file => {
        if (file.originalname.split('.')[0] === "thumbnail") {
          cloudUrl.imageUrl(file)
            .then(data => {
              membershipData.membershipThumbnail = data
            })
            .catch(err => {
              res.send({ msg: "thumbnail not uploaded!", success: false })
            })
        } else {
          promises.push(cloudUrl.imageUrl(file))
        }
      });
      var docs = await Promise.all(promises);
      membershipData.membershipDoc = docs;
    }
    membershipModal
      .updateOne({ _id: membershipId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: membershipData })

      .exec(async (err, data) => {
        if (err) {
          res.send({
            msg: err,
            success: false,
          });
        } else {
          if (data.n < 1) {
            return res.send({
              msg: "This is system generated membership Only admin can update",
              success: false,
            });
          }
          await membershipFolder.findByIdAndUpdate(new_folderId, {
            $addToSet: { membership: membershipId },
          });
          await membershipFolder
            .findByIdAndUpdate(old_folderId, {
              $pull: { membership: membershipId },
            })
            .exec((err, temp) => {
              if (err) {
                res.send({
                  msg: "membership not updated",
                  success: false,
                });
              } else {
                res.send({
                  msg: "membership updated successfully",
                  success: true,
                });
              }
            });
        }
      });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
};

exports.mergeDoc = async (req, res) => {
  let docBody = req.body.docUrl;
  let studentId = req.params.studentId;
  let userId = req.params.userId;
  let membershipId = req.params.membershipId;
  try {
    const studentInfo = await Student.findOne({ _id: studentId });
    // const membershitInfo = await membershipModal.findOne({ _id: membershipId });
    const mergedInfo = { ...studentInfo };
    // var archive = new zip();
    // let data = await dataFromUrl()
    // let resp = await writeFile(docBody)
    await axios.get(docBody, {
      responseType: 'arraybuffer',
    }).then(respon => {
      let buffers = respon.data
      var zip = new jszip;
      zip.file('simple.doc', buffers, { binary: true })
      zip.generateAsync({ type: "nodebuffer", compression: 'DEFLATE' })
        .then(function callback(buffer) {
          saveAs(buffer, "main.zip");
          const doc = new Docxtemplater("main.zip", {
            paragraphLoop: true,
            linebreaks: true,
          })
          doc.render(mergedInfo, function (err, resp) {
            if (err) {
              res.send({ msg: "PDF not created", success: false })
            } else {
              console.log(resp);
              //const buf = doc.getZip().generate({ type: "nodebuffer" });
              res.send({ msg: resp, success: true })
            }
          })
        }).catch(err => {
          console.log(err)
        })
    }).catch(err => {
      console.log(err)
    })


  } catch (err) {
    throw (err);
  }
}