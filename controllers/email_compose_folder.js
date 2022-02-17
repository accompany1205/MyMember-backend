const Folder = require("../models/email_compose_folder");
const ComposeCat = require('../models/email_compose_Category')

exports.create_folder = (req, res) => {
    if (!req.body.folderName) {
        res.send({ error: "Invalid Input", suuces: true })
    } else {
        var folderObj = new Folder(req.body)
        folderObj.save((err, folder) => {
            if (err) {
                res.send({ msg: "Folder name already exist!", success: false });
            }
            else {
                ComposeCat.findByIdAndUpdate(req.params.catId, { $push: { folder: folder._id } })
                    .exec((err, folderUpdate) => {
                        if (err) {
                            res.send({ msg: 'folder id is not push in category', success: false })
                        }
                        else {
                            res.send({ msg: 'folder create successfully', success: true })
                        }
                    })
            }
        })
    }
}

exports.list_template = async (req, res) => {
    Folder
        .findById(req.params.folderId)
        .populate({
            path: "template",
        })
        .exec((err, template_data) => {
            if (err) {
                res.send({ msg: "Compose template list not found", success: true });
            } else {
                res.send({ data: template_data, success: true });
            }
        });
};
exports.update_folder = (req, res) => {
    Folder.findByIdAndUpdate(req.params.folderId, req.body)
        .exec((err, updateFolder) => {
            if (err) {
                res.send({ msg: 'folder  not updated', success: false })
            }
            else {
                res.send({ msg: 'folder is update successfully', success: true })
            }
        })
}

exports.delete_folder = (req, res) => {
    Folder.findOneAndRemove({ _id: req.params.folderId }, (err, delFolder) => {
        if (err) {
            res.send({ msg: 'folder not removed', success: false })
        }
        else {
            ComposeCat.updateOne({ "folder": req.params.folderId }, { $pull: { "folder": req.params.folderId } }, (err, data) => {
                if (err) {
                    res.send({ msg: 'folder  not removed', success: false })
                }
                else {
                    res.send({ msg: 'folder remove successfully', success: true })
                }
            })
        }
    })
}

