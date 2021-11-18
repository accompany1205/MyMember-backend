const All_Temp = require("../models/emailSentSave")
const library_folder = require("../models/email_library_folder")
const auth_Key = require("../models/email_key")
const async = require('async')
const sgMail = require("sendgrid-v3-node");
const moment = require('moment');
const cron = require('node-cron')

function timefun(sd, st) {
    var date = sd
    var stime = st
    var spD = date.split('/')
    var spT = stime.split(":")

    var y = spD[2]
    var mo = parseInt(spD[0]) - 1
    var d = parseInt(spD[1])
    var h = spT[0]
    var mi = spT[1]
    var se = '0'
    var mil = '0'
    return curdat = new Date(y, mo, d, h, mi, se, mil)

}

exports.swapAndUpdate_template = async (req, res) => {

    if (req.body.length < 1) {
        res.send({ message: 'invalid input' })
    }
    else {
        const updateTO = req.body.updateTo
        const ObjectIdOfupdateTo = req.body.ObjectIdOfupdateTo
        const updateFrom = req.body.updateFrom
        const ObjectIdOfupdateFrom = req.body.ObjectIdOfupdateFrom
        const first = await all_temp.findByIdAndUpdate(ObjectIdOfupdateTo, { templete_Id: updateFrom })
        const second = await all_temp.findByIdAndUpdate(ObjectIdOfupdateFrom, { templete_Id: updateTO })
            .exec((err, allTemp) => {
                if (err) {
                    res.send({ code: 400, msg: 'email list not found' })
                }
                else {
                    res.send({ code: 200, msg: 'drag and droped successfully', success: true })
                }
            })
    }
}

exports.list_template = (req, res) => {
    library_folder.findById(req.params.folderId)
        .populate({ path: 'template',
      match: { is_Sent: false ,email_type:'schedule'},
         options: { sort: { templete_Id: 1 } } })
        .exec((err, template_data) => {
            if (err) {
                res.send({ error: 'library template list not found' })
            }
            else {
                res.send(template_data)
            }
        })
}

exports.add_template = async (req, res) => {
    const counts = await All_Temp.find({ folderId: req.params.folderId }).countDocuments()
    let templete_Id = counts + 1

    let { to, from, title, subject, template, sent_time, repeat_mail, sent_date, follow_up } = req.body || {};
    let { userId, folderId } = req.params || {};

    const obj = {
        to,
        from,
        title,
        subject,
        template,
        sent_date,
        sent_time,
        DateT: date_iso_follow,
        repeat_mail,
        follow_up,
        email_type: 'schedule',
        email_status: true,
        category: 'library',
        userId,
        folderId,
        templete_Id
    };

    sent_date = moment(sent_date).format('YYYY-MM-DD')
    let scheduleDateOfMonth = moment(sent_date).format('DD')
    let scheduleMonth = moment(sent_date).format('MM')
    let scheduleDay = moment(sent_date).format('dddd')

    if (req.body.follow_up === 0) {
        var date_iso = timefun(req.body.sent_date, req.body.sent_time)
        obj.DateT = date_iso;
    }
    else if (req.body.follow_up < 0) {
        res.send({ code: 400, msg: 'follow up not set less then 0' })
    }

    else {
        var date_iso_follow = timefun(req.body.sent_date, req.body.sent_time)
        date_iso_follow.setDate(date_iso_follow.getDate() + req.body.follow_up);
        var nD = moment(date_iso_follow).format('MM/DD/YYYY')
        saveEmailTemplate(obj)
        .then((data) => {
            library_folder.findByIdAndUpdate(folderId, { $push: { template: data._id }})
             .then((data)=>{
                res.send({ msg: `Email scheduled  Successfully on ${sent_date}`, success: true });
            }).catch(er=>{
               res.send( { error: 'compose template details is not add in folder', success: false })})
        })
        .catch((ex) => {
            res.send({
                success: false,
                msg: ex.message              
            })
        })

    }
}
function saveEmailTemplate(obj) {
    return new Promise((resolve, reject) => {
        let emailDetail = new All_Temp(obj)
        emailDetail.save((err, data) => {
            if (err) {
                reject({data: "Data not save in Database!", success: false})
            } else {
                resolve(data)
            } 
        })
    })
}


exports.single_tem_updte_status = (req, res) => {
    if (req.body.email_status == true) {
        All_Temp.updateOne({ _id: req.params.tempId }, { $set: { email_status: true } }, (err, resp) => {
            if (err) {
                res.json({ code: 400, msg: 'email library status not deactive' })
            }
            else {
                res.json({ code: 200, msg: 'email library status active successfully' })
            }
        })
    } else if (req.body.email_status == false) {
        All_Temp.updateOne({ _id: req.params.tempId }, { $set: { email_status: false } }, (err, resp) => {
            if (err) {
                res.json({ code: 400, msg: 'email library status not active' })
            }
            else {
                res.json({ code: 200, msg: 'email library status deactive successfully' })
            }
        })
    }
}

exports.update_template = (req, res) => {
    All_Temp.update({ _id: req.params.templateId }, req.body)
        .exec((err, updateTemp) => {
            if (err) {
                res.send({ code: 400, msg: 'template is not update' })
            }
            else {
                res.send({ code: 200, msg: 'template update success', result: updateTemp })
            }
        })
}

exports.status_update_template = (req, res) => {
    if (req.body.status == false) {
        All_Temp.find({ $and: [{ userId: req.params.userId }, { folderId: req.params.folderId }] })
            .exec((err, TempData) => {
                if (err) {
                    res.send({ code: 400, msg: 'all email template not deactive' })
                }
                else {
                    async.eachSeries(TempData, (obj, done) => {
                        All_Temp.findByIdAndUpdate(obj._id, { $set: { email_status: false } }, done)
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
    else if (req.body.status == true) {

        All_Temp.find({ $and: [{ userId: req.params.userId }, { folderId: req.params.folderId }] })
            .exec((err, TempData) => {
                if (err) {
                    res.send(err)
                }
                else {
                    async.eachSeries(TempData, (obj, done) => {
                        All_Temp.findByIdAndUpdate(obj._id, { $set: { email_status: true } }, done)
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

exports.remove_template = (req, res) => {
    All_Temp.findByIdAndRemove(req.params.templateId, (err, removeTemplate) => {
        if (err) {
            res.send({ Error: 'library template is not remove', error: err })
        }
        else {
            library_folder.update({ "template": removeTemplate._id }, { $pull: { "template": removeTemplate._id } },
                function (err, temp) {
                    if (err) {
                        res.send({ error: 'library template details is not remove in folder' })
                    }
                    else {
                        res.send({ msg: 'library template is remove successfully' })
                    }
                })
        }
    })
}


exports.multipal_temp_remove = (req, res) => {
    all_temp.deleteMany({ _id: req.body.tempId }).exec((err, resp) => {
        if (err) {
            res.json({ code: 400, msg: 'templates not remove' })
        }
        else {
            res.json({ code: 200, msg: 'template is remove successfully' })
        }
    })
}