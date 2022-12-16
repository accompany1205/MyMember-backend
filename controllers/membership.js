const membershipModal = require('../models/membership');
const membershipFolder = require('../models/membershipFolder');
const BuyMembership = require('../models/buy_membership');
const cloudUrl = require('../gcloud/imageUrl');
const Student = require('../models/addmember');
const fs = require('fs');
const mergeFile = require('../Services/mergeFile');

exports.create = async (req, res) => {
  try {
    const membershipDetails = req.body;
    membershipDetails.userId = req.params.userId;
    membershipDetails.adminId = req.params.adminId;
    membershipDetails.folderId = req.params.folderId;
    const promises = [];
    if (req.file) {
      membershipDetails.membershipDocName = req.file.originalname;
      await cloudUrl
        .imageUrl(req.file)
        .then((data) => {
          membershipDetails.membershipDoc = data;
        })
        .catch((err) => {
          res.send({ msg: 'file not uploaded!', success: false });
        });
      // req.files.map((file) => {
      //   if (file.originalname.split('.')[0] === 'thumbnail') {
      //     cloudUrl
      //       .imageUrl(file)
      //       .then((data) => {
      //         membershipDetails.membershipThumbnail = data;
      //       })
      //       .catch((err) => {
      //         res.send({ msg: 'Thumbnail not uploaded!', success: false });
      //       });
      //   } else {
      //     promises.push(cloudUrl.imageUrl(file));
      //   }
      // });
      // var docs = await Promise.all(promises);
    }
    //membershipDetails.membershipDoc = docs;
    const membershipObj = new membershipModal(membershipDetails);
    await membershipObj.save((err, data) => {
      if (err) {
        res.send({ msg: 'Membership not created', success: false });
      } else {
        membershipFolder.findByIdAndUpdate(
          req.params.folderId,
          {
            $push: { membership: data._id },
          },
          (err, data) => {
            if (err) {
              res.send({
                msg: 'Membership not added in folder',
                success: false,
              });
            } else {
              res.send({
                msg: 'membership created successfully',
                success: true,
              });
            }
          }
        );
      }
    });
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ''), success: false });
  }
};

exports.read = (req, res) => {
  const userId = req.params.userId;
  const adminId = req.params.adminId;
  membershipModal
    .find({ $and: [{ userId: { $in: [userId] } }, { adminId: adminId }] })
    .exec((err, data) => {
      if (err) {
        res.send({ error: 'membership list is not find' });
      } else {
        res.send({ data, success: true });
      }
    });
};

exports.membershipInfo = (req, res) => {
  var membershipId = req.params.membershipId;
  membershipModal.findById(membershipId).exec((err, data) => {
    if (err) {
      res.send({ msg: 'membership  not found', success: false });
    } else {
      res.send({ data, success: true });
    }
  });
};

exports.remove = (req, res) => {
  const membershipId = req.params.membershipId;
  const adminId = req.params.adminId;
  const userId = req.params.userId;
  try {
    membershipModal.findOneAndRemove(
      { _id: membershipId, $and: [{ userId: userId }, { adminId: adminId }] },
      (err, data) => {
        if (err) {
          res.send({ msg: 'membership is not delete', success: false });
        } else {
          if (!data) {
            return res.send({
              msg: 'This is system generated membership Only admin can delete',
              success: false,
            });
          }
          membershipFolder.updateOne(
            { membership: data._id },
            { $pull: { membership: data._id } },
            function (err, temp) {
              if (err) {
                res.send({
                  msg: 'membership not removed',
                  success: false,
                });
              } else {
                res.send({
                  msg: 'membership removed successfully',
                  success: true,
                });
              }
            }
          );
        }
      }
    );
  } catch (er) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false });
  }
};

exports.membershipUpdate = async (req, res) => {
  try {
    var membershipData = req.body;
    const membershipId = req.params.membershipId;
    const adminId = req.params.adminId;
    const userId = req.params.userId;
    const new_folderId = req.body.folderId;
    const old_folderId = req.body.old_folderId;
    membershipData.folderId = new_folderId;
    //const promises = [];
    if (req.file) {
      membershipData.membershipDocName = req.file.originalname;
      
      var docs = await cloudUrl.imageUrl(req.file);
      membershipData.membershipDoc = docs;
    }
    membershipModal
      .updateOne(
        { _id: membershipId, $and: [{ userId: userId }, { adminId: adminId }] },
        { $set: membershipData }
      )

      .exec(async (err, data) => {
        if (err) {
          res.send({
            msg: err,
            success: false,
          });
        } else {
          if (data.n < 1) {
            return res.send({
              msg: 'This is system generated membership Only admin can update',
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
                  msg: 'membership not updated',
                  success: false,
                });
              } else {
                res.send({
                  msg: 'membership updated successfully',
                  success: true,
                });
              }
            });
        }
      });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false });
  }
};




exports.mergeDoc = async (req, res) => {
  let docBody = req.body.docUrl;
  let studentId = req.params.studentId;
  //let userId = req.params.userId;
  let membershipId = req.params.membershipId;
  let buyMembershipId = req.params.buyMembershipId;
  try {
    const studentInfo = await Student.findOne({ _id: studentId });
    const membershipInfo = await membershipModal.findOne({ _id: membershipId });
    let ipAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
    if (studentInfo && membershipInfo) {
      var mergedInfo = { ...studentInfo.toJSON(), ...membershipInfo.toJSON() }
      let fileObj = await mergeFile(docBody, mergedInfo)
      //fs.writeFileSync(path.resolve(__dirname, "output.pdf"), finalPDF);
      cloudUrl.imageUrl(fileObj).then(Docresp => {
        BuyMembership.updateOne({ _id: buyMembershipId }, { $set: { mergedDoc: Docresp } }).then(datas => {
          BuyMembership.findOne({ _id: buyMembershipId }).then(data => {
            res.send({ msg: "get merged doc", success: true, data: data.mergedDoc, ipAddress: ipAddress, emailTokn: data.emailToken })
          }).catch(err => {
            res.send({ msg: "data not found", success: false });
          })
        }).catch(err => {
          res.send({ msg: "merged doc not added!", success: false })
        })
      }).catch(err => {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
      })
    } else {
      res.send({ msg: "membership or student not found!", success: false })
    }

  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
}
