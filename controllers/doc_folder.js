const docFolder = require("../models/doc_folder")

exports.createfolder = async (req, res) => {
    try {
        let userId = req.params.userId;
        let adminId = req.params.adminId;
        let folderObj = await new docFolder({
            folderName: req.body.folderName,
            userId: userId,
            adminId: adminId
        });
        folderObj.save((err, folder) => {
            if (err) {
                res.send({ msg: "Folder name already exist!", success: false });
            } else {
                res.send({
                    msg: "Document folder created successfully",
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
    try {
        await docFolder.find({ userId: req.params.userId })
            .populate('subFolder')
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

exports.editFolder = async (req, res) => {
    try {
        await docFolder.findByIdAndUpdate(req.params.docfolderId, req.body)
            .exec((err, updateFolder) => {
                if (err) {
                    res.send({ msg: 'document folder is not update', success: false })
                }
                else {
                    res.send({ msg: 'document folder is update successfully', success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.removeFolder = async (req, res) => {
    try {
        await docFolder.findByIdAndRemove(req.params.docfolderId)
            .exec((err, removeFolder) => {
                if (err) {
                    res.send({ success: false, msg: 'document folder is not remove' })
                }
                else {
                    res.send({ msg: 'document folder is remove successfully', success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}