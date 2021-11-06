const addTemp = require("../../models/emailSentSave")
const systemFolder = require("../../models/email_system_folder")
const user = require("../../models/user")
const async = require('async')

exports.list_template = (req, res) => {
    systemFolder.findById(req.params.folderId)
        .populate('template')
        .exec((err, template_data) => {
            if (err) {
                res.send({ error: 'nurturing template list not found' })
            }
            else {
                res.send(template_data)
            }
        })
}

exports.add_template = async (req, res) => {
    try {
        let adminId = req.params.adminId;
        let userData = await user.findById(adminId);
        if (userData.role === 1) {
            var obj = {
                title: req.body.title,
                subject: req.body.subject,
                template: req.body.template,
                email_type: 'schedule',
                category: 'system',
                createdBy: 'admin',
                email_status: true,
                // email_auth_key:Key.auth_key,
                adminId:adminId,
                folderId: req.params.folderId
            }
            var emailDetail = new addTemp(obj)
            emailDetail.save((err, emailSave) => {
                if (err) {
                    res.send(err)
                }
                else {
                    systemFolder.findByIdAndUpdate(req.params.folderId, { $push: { template: emailSave._id } })
                        .exec((err, template) => {
                            if (err) {
                                res.send({ Error: 'system template details is not add in folder', error: err })
                            }
                            else {
                                res.send({ msg: 'system template details is add in folder', result: emailSave })
                            }
                        })
                }
            })
        }else{
            res.json({
                msg:'not an Admin, not authorized to create sys template.',
                success:false,
                code:(403)
            })
        }
    } catch (error) {
        console.log(error)
    }

}
//  })

// }

exports.remove_template = (req, res) => {
    addTemp.findByIdAndRemove(req.params.templateId, (err, removeTemplate) => {
        if (err) {
            res.send({ error: 'system template is not remove' })
        }
        else {
            systemFolder.update({ "template": removeTemplate._id }, { $pull: { "template": removeTemplate._id } },
                function (err, temp) {
                    if (err) {
                        res.send({ error: 'system template details is not remove in folder' })
                    }
                    else {
                        res.send({ msg: 'system template is remove successfully' })
                    }
                })
        }
    })
}

exports.update_template = (req, res) => {
    addTemp.update({ _id: req.params.templateId }, req.body, (err, updateTemp) => {
        if (err) {
            res.send({ error: 'template is not update' })
        }
        else {
            res.send(updateTemp)
        }
    })
}

exports.status_update_template = (req, res) => {
    if (req.body.status == 'false') {
        addTemp.find({ $and: [{ adminId: req.params.adminId }, { folderId: req.params.folderId }] })
            .exec((err, TempData) => {
                if (err) {
                    res.send(err)
                }
                else {
                    async.eachSeries(TempData, (obj, done) => {
                        addTemp.findByIdAndUpdate(obj._id, { $set: { email_status: false } }, done)
                    }, function Done(err, List) {
                        if (err) {
                            res.send(err)
                        }
                        else {
                            res.send({ msg: 'this folder all template is deactivate' })
                        }
                    })
                }
            })
    }
    else if (req.body.status == 'true') {
        addTemp.find({ $and: [{ adminId: req.params.adminId }, { folderId: req.params.folderId }] })
            .exec((err, TempData) => {
                if (err) {
                    res.send(err)
                }
                else {
                    async.eachSeries(TempData, (obj, done) => {
                        addTemp.findByIdAndUpdate(obj._id, { $set: { email_status: true } }, done)
                    }, function Done(err, List) {
                        if (err) {
                            res.send(err)
                        }
                        else {
                            res.send({ msg: 'this folder all template is activate' })
                        }
                    })
                }
            })
    }
}
