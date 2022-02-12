const user = require('../models/user')
const emailCompose = require('../models/email_compose_Category')
const emailSent = require('../models/emailSentSave')
const smartlist = require("../models/smartlists");
const Mailer = require("../helpers/Mailer");
const cloudUrl = require("../gcloud/imageUrl");
const ObjectId = require('mongodb').ObjectId;
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// // const sgMail = require('sendgrid-v3-node');
// const AuthKey = require('../models/email_key')
// sgMail.setApiKey(process.env.email);
function TimeZone() {
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const date_time = str.split(',')
    const date = date_time[0]
    const time = date_time[1]
    return { Date: date, Time: time }
}

exports.userEmailList = (req, res) => {
    user.findOne({ _id: req.params.userId })
        .select('bussinessEmail')
        .exec((err, userEmail) => {
            if (err) {
                res.send(err)
            }
            else {
                res.send(userEmail)
            }
        })
}


// exports.smartList = (req, res) => {
//     Member.aggregate([
//         { $match: { $and: [{ userId: req.params.userId }] } },
//         {
//             $group: {
//                 _id: "$studentType",
//                 "count": { "$sum": 1 },
//                 list: { $push: { firstName: "$firstName", lastName: "$lastName", primaryPhone: "$primaryPhone", email: "$email", status: "$status", _id: "$_id" } },
//             }
//         }
//     ]).exec((err, sList) => {
//         if (err) {
//             res.send({ code: 400, msg: 'smart list not found', success: false })
//         }
//         else {
//             res.send({ code: 200, msg: sList, success: true })
//         }
//     })
// }

exports.category_list = (req, res) => {
    emailCompose.find({ userId: req.params.userId })
        .populate({
            path: 'folder',
            populate: {
                path: 'template',
                model: 'sentOrscheduleEmail'
            }
        })
        .exec((err, categoryList) => {
            if (err) {
                res.send({ error: 'compose category is not found' })
            }
            else {
                res.send(categoryList)
            }
        })
}

exports.sendEmail = async (req, res) => {
    let userId = req.params.userId;
    try {
        if (!req.body.subject || !req.body.template) {
            res.send({ error: "invalid input", success: false })
        }
        let {
            to,
            from,
            subject,
            template,
            smartLists,
            text,
            isPlaceHolders,
        } = req.body;
        if (!to) {
            smartLists = smartLists ? JSON.parse(smartLists) : []
            smartLists = smartLists.map(s => ObjectId(s));

            if (JSON.parse(isPlaceHolders)) {
                let [mapObj] = await smartlist.aggregate([
                    {
                        $match: {
                            _id: { $in: smartLists }
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            localField: "smartlists",
                            foreignField: "_id",
                            as: "data"
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            data: 1
                        }
                    },
                    { $unwind: "$data" },
                    {
                        $group: {
                            _id: "data",
                            data: { $push: "$data" }
                        }
                    },
                    {
                        $project: {
                            _id: 0
                        }

                    }


                ])

                mapObj = mapObj ? mapObj : []

                if (!mapObj.data.length) {
                    return res.send({
                        msg: `No Smartlist exist!`,
                        success: false,
                    });
                }

                (mapObj.data).map(Element => {
                    let temp = template;

                    for (i in Element) {
                        if (temp.includes(i)) {
                            temp = replace(temp, i, Element[i])
                        }
                    }
                    console.log({ from, to: Element["email"], subject, html: temp });

                })

                return res.send({ data: mapObj.data })


            }
            let [smartlists] = await smartlist.aggregate([
                {
                    $match: {
                        _id: { $in: smartLists }
                    }
                },
                {
                    $lookup: {
                        from: "members",
                        localField: "smartlists",
                        foreignField: "_id",
                        as: "data"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        data: "$data.email"
                    }
                },
                { $unwind: "$data" },
                {
                    $group: {
                        _id: "",
                        emails: { $addToSet: "$data" }
                    }
                },
                {
                    $project: {
                        _id: 0
                    }

                }
            ])

            smartlists = smartlists ? smartlists : []

            if (!smartlists.emails.length) {
                return res.send({
                    msg: `No Smartlist exist!`,
                    success: false,
                });
            }

            to = smartlists.emails
        }
        let attachment = req.files;
        const attachments = attachment.map((file) => {
            let content = Buffer.from(file.buffer).toString("base64")
            return {
                content: content,
                filename: file.originalname,
                type: `application/${file.mimetype.split("/")[1]}`,
                disposition: "attachment"
            }
        })
        // let promises = []
        // if (req.files) {
        //     (req.files).map(file => {
        //         promises.push(cloudUrl.imageUrl(file))
        //     });
        //     attachments = await Promise.all(promises);
        // }

        const obj = {
            to: JSON.parse(to),
            from,
            subject,
            template,
            category: 'compose',
            userId,
            attachments: attachments
        };

        const emailData = new Mailer({
            to: obj.to,
            from,
            subject,
            text: text,
            html: template,
            attachments: attachments
        })

        emailData.sendMail()
            .then(resp => {
                var emailDetail = new emailSent(obj)
                emailDetail.save((err, emailSave) => {
                    if (err) {
                        res.send({ msg: 'Email not sent!', success: false })
                    }
                    else {
                        emailSent.findByIdAndUpdate(emailSave._id, { is_Sent: true, })
                            .exec((err, emailUpdate) => {
                                if (err) {
                                    res.send({ msg: 'Email not sent!', success: false })
                                }
                                else {
                                    res.send({ msg: "Email Sent Successfully", success: true, emailUpdate })
                                }
                            })
                    }
                })
            })
            .catch(err => {
                res.send({ msg: 'email not sent', success: false })
            })

    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.addCategory = (req, res) => {
    var cat = {
        categoryName: req.body.categoryName,
        userId: req.params.userId
    }
    var category = new emailCompose(cat);
    category.save((err, data) => {
        if (err) {
            res.send({ msg: "Folder name already exist!", success: false });
        }
        else {
            res.send({ msg: 'Folder added successfully', success: true })
        }
    })
}

exports.updateCategory = (req, res) => {
    emailCompose.findByIdAndUpdate(req.params.categoryId, req.body)
        .exec((err, updateCat) => {
            if (err) {
                res.send({ msg: 'Folder is not update', success: false })
            }
            else {
                res.send({ msg: "Folder  updated successfully!", success: true })
            }
        })
}

exports.removeCategory = (req, res) => {
    var categoryId = req.params.categoryId;
    emailCompose.findByIdAndDelete(categoryId, (err, delData) => {
        if (err) {
            res.send({ msg: 'Folder is not delete', success: false })
        }
        else {
            res.send({ msg: 'Folder  removed successfully!', success: true })
        }
    })
}
function replace(strig, old_word, new_word) {
    return strig.replace(old_word, new_word)

}