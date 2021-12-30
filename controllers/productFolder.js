var productFolders = require('../models/productFolder')

exports.addproductFolder = async (req, res) => {
    let userId = req.params.userId;
    let folderObj = new productFolders({
        folderName: req.body.folderName,
        userId: userId,
    });
    folderObj.save((err, folder) => {
        if (err) {
            res.send({ msg: "Folder name already exist!", success: false });
        } else {
            res.send({
                msg: "product folder create successfully",
                data: folder,
                success: true,
            });
        }
    });
}

exports.getproductFolder = async (req, res) => {
    let userId = req.params.userId;
    productFolders.find({userId}).populate("TestFees")
        .exec((err, folder) => {
            if (err) {
                res.send({ msg: "product folder not found", success: false });
            } else {
                res.send({
                    data: folder,
                    success: true,
                });
            }
        });
}

exports.updateproductFolder = async (req, res) => {
    productFolders.findByIdAndUpdate(req.params.folderId, req.body)
        .exec((err, updateFolder) => {
            if (err) {
                res.send({ msg: "Product folder is not updated", success: false });
            } else {
                res.send({
                    msg: "Folder is update successfully",
                    success: true,
                });
            }
        });
}

exports.deleteproductFolder = async (req, res) => {
    productFolders.findOneAndRemove(
    { _id: req.params.folderId },
    (err, delFolder) => {
        if (err) {
            res.send({ msg: " folder is not remove", success: false });
        } else {
            res.send({
                msg: "Folder removed successfully",
                success: true,
            });
        }
    }
);
}