const membershipFolder = require("../models/membershipFolder");

exports.create_folder = (req, res) => {
  var folderObj = new membershipFolder(req.body);
  folderObj.save((err, folder) => {
    if (err) {
      res.send({ error: "membership folder is not create" ,success: false});
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
  const userId = req.body.userId;
  folderObj.find({ userId }, (err, folder) => {
    if (err) {
      res.send({ error: "membership folder is not create", success: false});
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
        res.send({ error: "membership folder is not update",success: false });
      } else {
        res.send({ msg: "membership folder is update successfully" ,success: true});
      }
    });
};

exports.delete_folder = (req, res) => {
  membershipFolder.findOneAndRemove(
    { _id: req.params.folderId },
    (err, delFolder) => {
      if (err) {
        res.send({ error: "membership folder is not remove", success: false });
      } else {
        res.send({ msg: "membership folder remove successfully", success: true });
      }
    }
  );
};
