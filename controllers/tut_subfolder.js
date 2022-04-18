const tutSubFolder = require("../models/tut_subfolder");
const tutFolder = require('../models/tut_folder')

exports.create_SubFolder = async (req, res) => {
    let userId = req.params.userId;
    let adminId = req.params.adminId;
    let folderId = req.params.folderId;
    let SubFolderObj = await new tutSubFolder({
        subfolderName: req.body.subfolderName,
        userId: userId,
        adminId: adminId,
        folderId: folderId
    });
    SubFolderObj.save((err, subfolder) => {
        if (err) {
            res.send({ msg: "subFolder name already exist!", success: false });
        } else {
            tutFolder.updateOne({ _id: folderId }, { $push: { subFolder: subfolder._id } })
                .exec((err, updteFolder) => {
                    if (err) {
                        res.send({ msg: 'subfolder not added in Folder', success: false })
                    }
                    else {
                        res.send({
                            msg: "SubFolder create successfully",
                            success: true,
                        });
                    }
                })

        }
    });
};


exports.update_SubFolder = async (req, res) => {
    const adminId = req.params.adminId
    const userId = req.params.userId;
    const subfolderId = req.params.subfolderId
    await tutSubFolder
        .updateOne({ _id: subfolderId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
        .exec((err, updateFolder) => {
            if (err) {
                res.send({ msg: "Folder is not updated", success: false });
            } else {
                if (updateFolder.n < 1) {
                    return res.send({
                        msg: "This is system generated folder Only admin can update",
                        success: false,
                    });
                }
                res.send({
                    msg: "subFolder updated successfully",
                    success: true,
                });
            }
        });
};

exports.delete_SubFolder = async (req, res) => {
    const adminId = req.params.adminId
    const userId = req.params.userId;
    const subfolderId = req.params.subfolderId;
    await tutSubFolder.findOneAndRemove(
        { _id: subfolderId, $and: [{ userId: userId }, { adminId: adminId }] },
        (err, delFolder) => {
            if (err) {
                res.send({ msg: "subFolder is not remove", success: false });
            } else {
                // console.log(delFolder)
                // if (!delFolder) {
                //     return res.send({
                //         msg: "This is system generated folder Only admin can delete",
                //         success: false,
                //     });
                // }
                tutFolder.updateOne({ "subFolder": subfolderId }, { $pull: { "subFolder": subfolderId } },
                    (err, delFolder) => {
                        if (err) {
                            res.send({ msg: "subFolder is not remove", success: false });
                        } else {
                            res.send({
                                msg: "subFolder removed successfully",
                                success: true,
                            })
                        }
                    })

            }
        })
}

