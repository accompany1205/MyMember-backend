const emailSystem = require("../../models/email_system_Category")
const user = require('../../models/user')
const emailSent = require('../../models/emailSentSave')
const sgMail = require('sendgrid-v3-node');


function TimeZone() {
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const date_time = str.split(',')
    const date = date_time[0]
    const time = date_time[1]
    return { Date: date, Time: time }
}
exports.category_list = (req, res) => {
    emailSystem.find({ adminId: req.params.adminId })
        .populate('folder')
        .exec((err, categoryList) => {
            if (err) {
                res.send({ error: 'system category is not found' })
            }
            else {
                res.send(categoryList)
            }
        })
}

exports.addCategory = (req, res) => {
    var cat = {
        categoryName: req.body.categoryName,
        adminId: req.params.adminId,
        createdBy: 'admin'
    }
    var category = new emailSystem(cat);
    category.save((err, data) => {
        if (err) {
            console.log(err)
            res.send({ error: 'system category is not add' })
        }
        else {
            res.send({ msg: 'system category is add successfully', category: data })
        }
    })
}

exports.updateCategory = (req, res) => {
    emailSystem.findByIdAndUpdate(req.params.categoryId, req.body)
        .exec((err, updateCat) => {
            if (err) {
                res.send({ error: 'system category is not update' })
            }
            else {
                res.send({ msg: "system category is update successfully" })
            }
        })
}

exports.removeCategory = (req, res) => {
    emailSystem.findByIdAndRemove(req.params.categoryId)
        .exec((err, delData) => {
            if (err) {
                res.send({ error: 'system category is not delete' })
            }
            else {
                res.send({ msg: 'system category is remove successfully' })
            }
        })
}

exports.sendEmail = (req, res) => {
    try {
        if (!req.body.subject || !req.body.template || !req.body.to) {
            res.send({ error: "invalid input", success: false })
        } else {
            let attachment = req.files;
            const attachments = attachment.map((file) => {
                let content = Buffer.from(file.buffer).toString("base64")
                return {
                    content: content,
                    filename: file.originalname,
                    type: `application/${file.mimetype.split("/")[1]}`,
                    disposition: "attachment"
                }
            });
            const emailData = {
                sendgrid_key: process.env.SENDGRID_API_KEY,
                to: req.body.to,
                from_email: process.env.from_email,
                //from_name: 'noreply@gmail.com',
                subject: req.body.subject,
                content: req.body.template,
                attachments: attachments
            };

            sgMail.send_via_sendgrid(emailData).then(resp => {
                var DT = TimeZone()
                var emailDetail = new emailSent(req.body)
                emailDetail.sent_date = DT.Date
                emailDetail.sent_time = DT.Time


                emailDetail.save((err, emailSave) => {
                    if (err) {
                        res.send({ error: 'email details is not save' })
                    }
                    else {
                        emailSent.findByIdAndUpdate(emailSave._id, { userId: req.params.userId, email_type: 'sent', category: 'system' })
                            .exec((err, emailUpdate) => {
                                if (err) {
                                    res.send({ error: 'user id is not update in sent email' })
                                }
                                else {
                                    res.send({ message: "Email Sent Successfully", success: true })
                                }
                            })
                    }
                })
            })

        }
    }
    catch (err) {
        res.send({ error: 'email not send', success: false })
    }
}