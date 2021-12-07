const membershipFolder = require("../models/membershipFolder");

exports.create_folder = (req, res) => {
  let userId = req.params.userId;

  let folderObj = new membershipFolder({
    folderName: req.body.folderName,
    userId: userId,
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
  const userId = req.params.userId;
  membershipFolder
    .find({ userId: userId })
    .populate("membership")

    .exec((err, folder) => {
      if (err) {
        res.send({ error: "membership folder is not create", success: false });
      } else {
        res.send({
          msg: "membership folder create successfully",
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
        res.send({ error: "membership folder is not update", success: false });
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
        res.send({ error: " folder is not remove", success: false });
      } else {
        res.send({
          msg: "Folder removed successfully",
          success: true,
        });
      }
    }
  );
};
