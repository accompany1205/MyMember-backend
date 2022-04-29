const goalsFolder = require("../models/goals_folder")
const goalssubFolder = require("../models/goals_subfolder")
const goals = require("../models/goals")

exports.createfolder = async (req, res) => {
    try {
        let userId = req.params.userId;
        let adminId = req.params.adminId;
        let folderObj = new goalsFolder({
            folderName: req.body.folderName,
            userId: userId,
            adminId: adminId
        });
        folderObj.save((err, folder) => {
            if (err) {
                res.send({ msg: "Folder name already exist!", success: false });
            } else {
                res.send({
                    msg: "Folder created successfully",
                    success: true,
                });
            }
        });
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.readfolder = async (req, res) => {
    let adminId = process.env.ADMINID
    const userId = req.params.userId;
    try {
        await goalsFolder
            .find({ $or: [{ userId: userId }, { adminId: adminId }] })
            .populate({
                path: 'subFolder',
                sort: {
                    'subFolderName': 1
                },
            //     populate: {
            //         path: 'goals',
            //         model: 'goals',
            //         sort: {
            //             'document_name': 1
            //         },
            //     }
            })
            // .populate("goals")
            // .sort({ folderName: 1 })
            .exec((err, folderList) => {
                if (err) {
                    res.send({ success: false, msg: 'document folder is not find' })
                }
                else {
                    res.send({ data: folderList, success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}
exports.getadminFolders = async (req, res) => {
    const adminId = req.params.adminId;
    await goalsFolder
        .find({ adminId: adminId })
        .populate({
            path: 'subFolder',
            populate: {
                path: 'document',
                model: 'goals'
            }
        })
        .populate({
            path: 'document',
            model: 'goals'
        })
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

exports.editFolder = async (req, res) => {
    const adminId = req.params.adminId
    const userId = req.params.userId;
    const folderId = req.params.folderId
    try {
        await goalsFolder
            .updateOne({ _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
            .exec((err, updateFolder) => {
                if (err) {
                    res.send({ msg: 'Document folder not updated!', success: false })
                }
                else {
                    if (updateFolder.n < 1) {
                        return res.send({
                            msg: "This is system generated folder Only admin can update",
                            success: false,
                        });
                    }
                    res.send({ msg: 'Folder update successfully', success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.removeFolder = async (req, res) => {
    const adminId = req.params.adminId
    const userId = req.params.userId;
    const folderId = req.params.folderId
    try {
        await goalsFolder.findOneAndRemove(
            { _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] },
            async (err, removeFolder) => {
                if (err) {
                    res.send({ success: false, msg: 'Document folder not removed' })
                }
                else {
                    if (!removeFolder) {
                        return res.send({
                            msg: "This is system generated folder Only admin can delete",
                            success: false,
                        });
                    }
                    await goalssubFolder.deleteMany({ folderId: folderId })
                    await goals.deleteMany({ rootFolderId: folderId })
                        .exec((err, delFolder) => {
                            if (err) {
                                res.send({ msg: "Folder is not remove", success: false });
                            } else {
                                res.send({
                                    msg: "Folder removed successfully",
                                    success: true,
                                })
                            }
                        })

                    // res.send({ msg: 'Document folder removed successfully', success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}