const docSubFolder = require("../models/doc_subfolder")
const DocFolder = require("../models/doc_folder")
const UploadFiles = require("../models/doc_upload")

exports.documentList = async (req, res) => {
    let subfolderId = req.params.subfolderId;
    try {
        UploadFiles.find({ subFolderId: subfolderId })
            .populate('uploadDocument')
            .exec((err, doclist) => {
                if (err) {
                    res.send({ msg: 'document list not found', success: false })
                }
                else {
                    res.send({ data: doclist, success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.createSubFolder = async (req, res) => {
    try {
        let userId = req.params.userId;
        let adminId = req.params.adminId;
        let folderId = req.params.folderId;
        let subfolderObj = await new docSubFolder({
            subFolderName: req.body.subFolderName,
            userId: userId,
            adminId: adminId
        });

        await subfolderObj.save((err, subfolder) => {
            if (err) {
                res.send({ msg: 'subFolder  already exist!', success: false })
            }
            else {
                DocFolder.updateOne({ _id: folderId }, { $push: { subFolder: subfolder._id } })
                    .exec((err, updteFolder) => {
                        if (err) {
                            res.send({ msg: 'subfolder not added in Folder', success: false })
                        }
                        else {
                            res.send({ 'msg': 'Subfolder create successfully', success: true })
                        }
                    })
            }
        })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.editSubFolder = async (req, res) => {
    try {
        docSubFolder.updateOne({ _id: req.params.subfolderId }, req.body)
            .exec((err, updatsubFolder) => {
                if (err) {
                    res.send({ msg: 'subFolder  already exist!', success: false })
                }
                else {
                    res.send({ msg: "subFolder updated Successfully", success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.removeSubFolder = async (req, res) => {
    try {
        let subfolderId = req.params.subfolderId
        await docSubFolder.findOneAndRemove({ _id: subfolderId })
            .exec((err, removeFolder) => {
                if (err) {
                    res.send({ msg: 'sub folder not removed!', success: false })
                }
                else {
                    if (removeFolder) {
                        DocFolder.updateOne({ "subFolder": removeFolder._id }, { $pull: { "subFolder": removeFolder._id } },
                            function (err, data) {
                                if (err) {
                                    res.send({ msg: 'subfolder is not remove from folder', success: false })
                                }
                                else {
                                    res.send({
                                        msg: 'subfolder removed successfully', success: true
                                    })
                                }
                            })
                    }
                    else {
                        res.send({
                            msg: 'subfolder removed already!', success: true
                        })
                    }
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}
