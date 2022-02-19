const membershipFolder = require("../models/membershipFolder");
const membership = require('../models/membership')

exports.create_folder = async (req, res) => {
  let userId = req.params.userId;
  let adminId = req.params.adminId;
  let folderObj = await new membershipFolder({
    folderName: req.body.folderName,
    userId: userId,
    adminId: adminId
  });
  folderObj.save((err, folder) => {
    if (err) {
      res.send({ msg: "Folder name already exist!", success: false });
    } else {
      res.send({
        msg: "membership folder create successfully",
        success: true,
      });
    }
  });
};
exports.getFolders = async (req, res) => {
  let adminId = process.env.ADMINID
  const userId = req.params.userId;
  await membershipFolder
    .find({ $or: [{ userId: userId }, { adminId: adminId }] })
    .populate({
      path: "membership",
      sort: {
        membership_name: 1
      }
    })
    .sort({ folderName: 1 })
    .exec((err, folder) => {
      if (err) {
        res.send({ msg: "membership folder is not create", success: false });
      } else {
        res.status(200).send({
          data: folder,
          success: true,
        });
      }
    });
};

exports.getadminFolders = async (req, res) => {
  const adminId = req.params.adminId;
  await membershipFolder
    .find({ adminId: adminId })
    .populate({
      path: "membership",
      sort: {
        membership_name: 1
      }
    })
    .sort({ folderName: 1 })
    .exec((err, folder) => {
      if (err) {
        res.send({ msg: "membership folder is  found", success: false });
      } else {
        res.status(200).send({
          data: folder,
          success: true,
        });
      }
    });
};

exports.update_folder = async (req, res) => {
  const adminId = req.params.adminId
  const userId = req.params.userId;
  const folderId = req.params.folderId
  await membershipFolder
    .updateOne({ _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
    .exec((err, updateFolder) => {
      if (err) {
        res.send({ msg: "membership folder is not updated", success: false });
      } else {
        if (updateFolder.n < 1) {
          return res.send({
            msg: "This is system generated folder Only admin can update",
            success: false,
          });
        }
        res.send({
          msg: "Folder is update successfully",
          success: true,
        });
      }
    });
};

exports.delete_folder = async (req, res) => {
  const adminId = req.params.adminId
  const userId = req.params.userId;
  const folderId = req.params.folderId
  await membershipFolder.findOneAndRemove(
    { _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] },
    (err, delFolder) => {
      if (err) {
        res.send({ msg: "Folder is not remove", success: false });
      } else {
        if (!delFolder) {
          return res.send({
            msg: "This is system generated folder Only admin can delete",
            success: false,
          });
        }
        membership.deleteMany(
          { folderId: req.params.folderId },
          (err, delFolder) => {
            if (err) {
              res.send({ msg: "Folder is not remove", success: false });
            } else {
              res.send({
                msg: "Folder removed successfully",
                success: true,
              })
            }
          })

      }
    })
}

