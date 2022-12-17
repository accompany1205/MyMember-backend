const userSettingFile = require("../models/userSectionFiles");
const cloudUrl = require("../gcloud/imageUrl");


exports.addFile = async (req, res) => {
    let userId = req.params.userId;
    let studentId = req.params.studentId;
    try {
        if (req.file) {
            let file = await cloudUrl.imageUrl(req.file);
            let folderdata = { ...req.body, userId: userId, studentId: studentId, SettingFile: file };
            const userFile = new userSettingFile(folderdata);
            userFile.save(function (err, data) {
                if (err) {
                    res.send({
                        msg: "file not added!", success: false,
                    })
                } else {
                    res.send({
                        msg: "file added!", success: true, data
                    })
                }
            });
        } else {
            res.send({
                msg: "please add file", success: false
            })
        }
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.updateFile = async (req, res) => {
    let userSectionFiles = req.params.userSectionFiles;
    let updatedData = req.body
    try {
        if (req.file) {
            let file = await cloudUrl.imageUrl(req.file);
            let updatedFolderData = { ...req.body, SettingFile: file };
            await userSettingFile.findByIdAndUpdate(userSectionFiles, { $set: updatedFolderData }).then(data => {
                res.send({
                    msg: "folder updated!", success: true
                })
            }).catch(err => {
                res.send({
                    msg: "not updated!", success: false, err
                })
            })
        } else {
            await userSettingFile.findByIdAndUpdate(userSectionFiles, { $set: updatedData })
                .then(data => {
                    res.send({
                        msg: "folder updated!", success: true, data
                    })
                }).catch(err => {
                    res.send({
                        msg: "not updated!", success: false, err
                    })
                })
        }
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.getFile = async (req, res) => {
    let userSectionFiles = req.params.userSectionFiles;
    try {
        await userSettingFile.findById({ _id: userSectionFiles }).then(data => {
            res.send({
                msg: "getData!", success: true, data
            })
        }).catch(err => {
            res.send({
                msg: "No Data!", success: false, err
            })
        })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.getAll = async (req, res) => {
    let userId = req.params.userId;
    let studentId = req.params.studentId;
    try {
        await userSettingFile.find({
            $and: [{ userId: userId },
            { studentId: studentId }
            ],
        }).then(data => {
            res.send({
                msg: "get data!", success: true, data
            })
        }).catch(err => {
            res.send({
                msg: "no data!", success: false
            })
        })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.getAllUserData = async (req, res) => {
    let userId = req.params.userId;
    try {
        await userSettingFile.find(
            { userId: userId }
        ).then(data => {
            res.send({
                msg: "get data!", success: true, data
            })
        }).catch(err => {
            res.send({
                msg: "no data!", success: false
            })
        })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.deleteFile = async (req, res) => {
    let userSectionFiles = req.params.userSectionFiles;
    try {
        userSettingFile.remove({ _id: userSectionFiles }).then(resp => {
            res.send({
                msg: "deleted!", success: true
            })
        }).catch(err => {
            res.send({
                msg: "not deleted!", success: false, err
            })
        })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}