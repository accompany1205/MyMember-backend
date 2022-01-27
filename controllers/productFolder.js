const productFolders = require('../models/productFolder')
const product = require('../models/product')
exports.createproductFolder = async (req, res) => {
    let adminId = req.params.adminId;
    let userId = req.params.userId;
    let folderObj = await new productFolders({
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
                success: true,
            });
        }
    });
}

exports.getproductFolder = async (req, res) => {
    let userId = req.params.userId;
    let adminId = process.env.ADMINID

    await productFolders.
        find({ $or: [{ userId: userId }, { adminId: adminId }] })
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
exports.getadminproductFolder = async (req, res) => {
    let adminId = req.params.adminId;

    await productFolders.
        find({ adminId: adminId })
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
    const adminId = req.params.adminId
    const userId = req.params.userId;
    const folderId = req.params.folderId
    await productFolders
        .updateOne({ _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
        .exec((err, updateFolder) => {
            if (err) {
                res.send({ msg: "Product folder is not updated", success: false });
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
}

exports.deleteproductFolder = async (req, res) => {
    const adminId = req.params.adminId
    const userId = req.params.userId;
    const folderId = req.params.folderId
    await productFolders.findOneAndRemove(
        { _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] },
        (err, delFolder) => {
            if (err) {
                res.send({ msg: " folder is not remove", success: false });
            }
            else {
                if (!delFolder) {
                    return res.send({
                        msg: "This is system generated folder Only admin can delete",
                        success: false,
                    });
                }
                product.deleteMany(
                    { folderId: req.params.folderId },
                    (err, delFolder) => {
                        if (err) {
                            res.send({ msg: "Folder is not remove", success: false });
                        }
                        else {
                            res.send({
                                msg: "Folder removed successfully",
                                success: true,
                            });
                        }
                    })

            }
        })
}

