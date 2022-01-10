const membershipModal = require("../models/membership");
const membershipFolder = require("../models/membershipFolder");

// const cloudinary = require("cloudinary").v2
const cloudUrl = require("../gcloud/imageUrl");

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
              res.send({ msg: "thumbnail not uploaded!", success: false })
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
        res.send({ msg: "membership not created", success: false });
      } else {
        membershipFolder.findByIdAndUpdate(
          req.params.folderId,
          {
            $push: { membership: data._id },
          },
          (err, data) => {
            if (err) {
              res.send({
                msg: "membership not addd in folder",
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
      res.send(data);
      // if(data.length>0){
      //     res.send(data);
      // }
      // else{
      //     res.send({msg:'membership list is empty'})
      // }
    }
  });
};

exports.membershipInfo = (req, res) => {
  var membershipId = req.params.membershipId;
  membershipModal.findById(membershipId).exec((err, data) => {
    if (err) {
      res.send({ error: "membership data not found" });
    } else {
      res.send(data);
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
            return res.status(401).send({
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
                  error: "membership is not remove from folder",
                  success: false,
                });
              } else {
                res.send({
                  msg: "membership  removed successfully",
                  success: true,
                });
              }
            }
          );
          //   res.send({ error: data });
        }
      });
  } catch (er) {
    throw new Error(er);
  }
};

exports.membershipUpdate = async (req, res) => {
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
          return res.status(401).send({
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
                error: "membership is not update from folder",
                success: false,
              });
            } else {
              res.send({
                msg: "membership  updated successfully",
                success: true,
              });
            }
          });
        // res.send({ message: "membership updated successfully", success: dat });
      }
    });
};
