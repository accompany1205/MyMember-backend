const cron = require('node-cron')
const all_temp = require("../models/emailSentSave");
const compose_folder = require("../models/email_compose_folder")
const authKey = require("../models/email_key")
const async = require('async')
const sgMail = require("sendgrid-v3-node");
const moment = require('moment');

// compose template

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

exports.getData = (req, res) => {
    let options = {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    },
        formatter = new Intl.DateTimeFormat([], options);

    var a = (formatter.format(new Date()));
    // var str = a
    // var h = str.split(",");
    // var dates = h[0]
    // var d = dates.split('/')
    // var curdat = new Date(`${d[1]} ${d[0]} ${d[2]} ${h[1]}`)

    var str = a
    var h = str.split(",");
    var dates = h[0]
    var d = dates.split('/')

    var time12h = h[1] // time change in 24hr
    const [b, time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }


    var y = d[2]
    var mo = d[1] - 1
    var d = d[0]
    var h = msg.hour
    var mi = msg.min
    var se = '0'
    var mil = '0'
    var curdat = new Date(y, mo, d, h, mi, se, mil)

    all_temp.aggregate([
        {
            $match: {
                $and: [{ email_status: true },
                { $expr: { $eq: [{ $month: '$DateT' }, { $month: curdat }] } },
                { $expr: { $eq: [{ $dayOfMonth: '$DateT' }, { $dayOfMonth: curdat }] } },
                { $expr: { $eq: [{ $year: '$DateT' }, { $year: curdat }] } },
                { $expr: { $eq: [{ $hour: '$DateT' }, { $hour: curdat }] } },
                { $expr: { $eq: [{ $minute: '$DateT' }, { $minute: curdat }] } },
                ]
            }
        }
    ]).exec((err, resp) => {
        if (err) {
            console.log(resp)
            res.json({ code: 400, msg: 'data not found' })
        }
        else {
            res.json({ code: 200, msg: resp })
        }
    })
}

exports.single_temp_update_status = (req, res) => {
    if (req.body.email_status == true) {
        all_temp.updateOne({ _id: req.params.tempId }, { $set: { email_status: true } }, (err, resp) => {
            if (err) {
                res.json({ code: 400, msg: 'email status not deactive' })
            }
            else {
                res.json({ code: 200, msg: 'email status active successfully' })
            }
        })
    } else if (req.body.email_status == false) {
        all_temp.updateOne({ _id: req.params.tempId }, { $set: { email_status: false } }, (err, resp) => {
            if (err) {
                res.json({ code: 400, msg: 'email status not active' })
            }
            else {
                res.json({ code: 200, msg: 'email status deactive successfully' })
            }
        })
    }
}

exports.status_update_template = (req, res) => {
    if (req.body.email_status == false) {
        all_temp.find({ $and: [{ userId: req.params.userId }, { folderId: req.params.folderId }] })
            .exec((err, TempData) => {
                if (err) {
                    res.send({ code: 400, msg: 'all email template not deactive' })
                }
                else {
                    async.eachSeries(TempData, (obj, done) => {
                        all_temp.findByIdAndUpdate(obj._id, { $set: { email_status: false } }, done)
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
    else if (req.body.email_status == true) {
        all_temp.find({ $and: [{ userId: req.params.userId }, { folderId: req.params.folderId }] })
            .exec((err, TempData) => {
                if (err) {
                    res.send({ code: 400, msg: 'all email template not active' })
                }
                else {
                    async.eachSeries(TempData, (obj, done) => {
                        all_temp.findByIdAndUpdate(obj._id, { $set: { email_status: true } }, done)
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

exports.all_email_list = async (req, res) => {
    all_temp.find({ userId: req.params.userId })
        .exec((err, allTemp) => {
            if (err) {
                res.send({ code: 400, msg: 'email list not found' })
            }
            else {
                res.send({ code: 200, msg: allTemp })
            }
        })
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

exports.list_template = async (req, res) => {
    compose_folder.findById(req.params.folderId)
        .populate({ path: 'template', options: { sort: { templete_Id: 1 } } })
        .exec((err, template_data) => {
            if (err) {
                res.send(err)
            }
            else {
                res.send(template_data)
            }
        })
}

exports.add_template = async (req, res) => {
    const counts = await all_temp.find({ folderId: req.params.folderId }).countDocuments()
    let templete_Id = counts + 1

    // var schedule = req.body.schedule
    //    authKey.findOne({userId:req.params.userId})      
    //     .exec((err,key)=>{
    //         if(err){
    //             res.send({Error:'email auth key is not find so schedule is not create',error:err})
    //         }
    //         else{

    let { to, from, title, subject, template, sent_time, repeat_mail, sent_date, follow_up } = req.body || {};
    let { userId, folderId } = req.params || {};

    const obj = {
        to,
        from,
        title,
        subject,
        template,
        sent_date: moment(sent_date).format('YYYY-MM-DD'),
        sent_time,
        DateT: date_iso_follow,
        repeat_mail,
        follow_up,
        email_type: 'schedule',
        email_status: true,
        category: 'compose',
        userId,
        folderId,
        templete_Id
    };

    // sent_date = moment(sent_date).format('YYYY-MM-DD')
    let scheduleDateOfMonth = moment(sent_date).format('DD')
    let scheduleMonth = moment(sent_date).format('MM')
    let scheduleDay = moment(sent_date).format('dddd')


    if (req.body.follow_up === 0) {
        var date_iso = timefun(req.body.sent_date, req.body.sent_time)
        obj.DateT = date_iso;
    }
    else if (req.body.follow_up > 0) {
        var date_iso_follow = timefun(req.body.sent_date, req.body.sent_time)
        date_iso_follow.setDate(date_iso_follow.getDate() + req.body.follow_up);
        var nD = moment(date_iso_follow).format('MM/DD/YYYY')
    }
    else if (req.body.follow_up < 0) {
        res.send({ code: 400, msg: 'follow up not set less then 0' })
    }

    emailDetail = new all_temp(obj)
    emailDetail.save((er, data) => {
        if (er) {
            res.send({ error: "Email not saved", success: false })

        }
        else {
            console.log('email saved And scheduled At', sent_date)
            mailId = data.id
            try {
                cron.schedule(`59 23 ${scheduleDateOfMonth} ${scheduleMonth} ${scheduleDay}`, async function () {
                    const emailData = {
                        sendgrid_key: process.env.SENDGRID_API_KEY,
                        to: req.body.to,
                        from_email: req.body.from,
                        from_name: 'noreply@gmail.com'
                    };

                    emailData.subject = subject;
                    emailData.content = template;
                    sgMail.send_via_sendgrid(emailData).then((data) => {
                        all_temp.findByIdAndUpdate(mailId, { is_Sent: true }, async (er, data) => {
                            if (er) {
                                res.send({ error: "Email not saved", success: false })
                            }
                            else {
                                await compose_folder.findOneAndUpdate(folderId, { $push: { template: data._id } }, (er, data) => {
                                    if (er) {
                                        res.send({ error: 'compose template details is not add in folder', success: false })
                                    }
                                    else {

                                        res.send({ msg: 'Email sent Successfully', success: true });

                                    }
                                })
                            }
                        }
                        )
                    }).catch((err) => {
                        console.log('hello')
                        res.send({ error: err.message.replace(/\"/g, ""), success: false })

                    })

                })
            }
            catch (err) {
                res.send({ error: 'email details is not save', success: false })

            }

        }
    })


}

// exports.add_template = async (req, res) => {
//     const counts = await all_temp.find({ folderId: req.params.folderId }).countDocuments()
//     let templete_Id = counts + 1
//     // var schedule = req.body.schedule
//     //    authKey.findOne({userId:req.params.userId})      
//     //     .exec((err,key)=>{
//     //         if(err){
//     //             res.send({Error:'email auth key is not find so schedule is not create',error:err})
//     //         }
//     //         else{

//     let { to, from, title, subject, template, sent_time, repeat_mail, follow_up } = req.body || {};
//     let { userId, folderId } = req.params || {};

//     const obj = {
//         to,
//         from,
//         title,
//         subject,
//         template,
//         sent_date: nD,
//         sent_time,
//         DateT: date_iso_follow,
//         repeat_mail,
//         follow_up,
//         email_type: 'schedule',
//         email_status: true,
//         category: 'compose',
//         userId,
//         folderId,
//         templete_Id
//     };

//     if (req.body.follow_up === 0) {
//         var date_iso = timefun(req.body.sent_date, req.body.sent_time)
//         obj.DateT = date_iso;
//     }
//     else if (req.body.follow_up > 0) {  
//         var date_iso_follow = timefun(req.body.sent_date, req.body.sent_time)
//         date_iso_follow.setDate(date_iso_follow.getDate() + req.body.follow_up);
//         var nD = moment(date_iso_follow).format('MM/DD/YYYY')

//     }
//     else if (req.body.follow_up < 0) {
//         res.send({ code: 400, msg: 'follow up not set less then 0' })
//     }


//     var emailDetail = new all_temp(obj)


//     try {
//         let emailSave = await emailDetail.save();
//         let template = await compose_folder.findByIdAndUpdate(folderId, { $push: { template: emailSave._id } })
//         try {

//             // wrong model
//             // let allData = await compose_folder
//             // .find({})
//             // .populate('template');

//             // right model
//             // let allData = await all_temp
//             // .find({})
//             return res.send({ msg: 'compose template details is add in folder', result: emailSave });
//         }
//         catch (err) {
//             return res.send({ error: 'compose template details is not add in folder' })
//         }
//     }

//     catch (err) {
//         res.send({ Error: 'email details is not save', error: err })
//     }
// }

exports.update_template = (req, res) => {
    all_temp.updateOne({ _id: req.params.templateId }, req.body, (err, updateTemp) => {
        if (err) {
            res.send({ code: 400, msg: 'template is not update' })
        }
        else {
            res.send({ code: 200, msg: 'template update success', result: updateTemp })
        }
    })
}

exports.remove_template = (req, res) => {
    // all_temp.remove({}).then().catch();
    all_temp.findByIdAndRemove(req.params.templateId, (err, removeTemplate) => {
        if (err) {
            res.send({ error: 'compose template is not remove' })
        }
        else {
            compose_folder.updateOne({ "template": removeTemplate._id }, { $pull: { "template": removeTemplate._id } },
                function (err, temp) {
                    if (err) {
                        res.send({ error: 'compose template details is not remove in folder' })
                    }
                    else {
                        res.send({ msg: 'compose template is remove successfully' })
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