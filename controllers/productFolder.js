var productFolders = require('../models/productFolder')

exports.createproductFolder = async (req, res) => {
    let adminId = req.params.adminId;
    let userId = req.params.userId;
    let folderObj = new productFolders({
        folderName: req.body.folderName,
        userId: userId,
        adminId: adminId
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
    let adminId = req.params.adminId;

    productFolders.
        find({ $and: [{ userId: userId }, { adminId: adminId }] })
        .populate("products")
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