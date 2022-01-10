const membershipFolder = require("../models/membershipFolder");
const membership = require('../models/membership')
exports.create_folder = (req, res) => {
  let userId = req.params.userId;
  let adminId = req.params.adminId;
  let folderObj = new membershipFolder({
    folderName: req.body.folderName,
    userId: userId,
    adminId: adminId
  });
  folderObj.save((err, folder) => {
    if (err) {
      res.send({ error: "Folder name already exist!", success: false });
    } else {
      res.send({
        msg: "membership folder create successfully",
        data: folder,
        success: true,
      });
    }
  });
};
exports.getFolders = (req, res) => {
  let adminId = process.env.ADMINID
  const userId = req.params.userId;
  membershipFolder
    .find({ $or: [{ userId: userId }, { adminId: adminId }] })
    .populate("membership")

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

exports.getadminFolders = (req, res) => {

  const adminId = req.params.adminId;
  membershipFolder
    .find({ adminId: adminId })
    .populate("membership")

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
exports.update_folder = (req, res) => {
  membershipFolder
    .findByIdAndUpdate(req.params.folderId, req.body)
    .exec((err, updateFolder) => {
      if (err) {
        res.send({ msg: "membership folder is not updated", success: false });
      } else {
        res.send({
          msg: "Folder is update successfully",
          success: true,
        });
      }
    });
};

exports.delete_folder = (req, res) => {
  membershipFolder.findOneAndRemove(
    { _id: req.params.folderId },
    (err, delFolder) => {
      if (err) {
        res.send({ msg: "Folder is not remove", success: false });
      } else {
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

