const SignStates = require("../models/signStates");
const Mailer = require("../helpers/Mailer");
// const sgMail = require("@sendgrid/mail");
const fetch = require('node-fetch');
const buyMembership = require("../models/buy_membership");
const buy_product = require("../models/buy_product");
const membershipModal = require('../models/membership');
const emailTemplateDocuSignUi = require('../helpers/emailTemplateDocuSignUi')
const buffToPdf = require("../Services/pdfConvertor");
const mongo = require('mongoose')
const pixelWidth = require('string-pixel-width');



function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

exports.addRequestSign = async (req, res) => {
    let userId = req.params.userId;
    try {
        let emailToken = makeid(20);
        await buyMembership.updateOne({ _id: req.body.signDocForId }, { $set: { emailToken: emailToken } });
        let datas = { ...req.body, userId: userId }
        const signStat = new SignStates(datas)
        await signStat.save(function (err, data) {
            if (err) {
                res.send({ success: false, msg: "Info not added!!", error: err.message.replace(/\"/g, "") })
            } else {
                res.send({ data, success: true, emailToken: emailToken });
            }
        })
    } catch (err) {
        res.send({ success: false, msg: "Info not added!!", error: err.message.replace(/\"/g, "") });
    }
}


exports.getRequestSignParam = async (req, res) => {
    try {
        let docuSignId = req.params.docuSignId;
        let email = req.query.email;
        await SignStates.find(docuSignId).then(async data => {
            if (!data.status) data.status = {}
            data.status[email] = { viewed: new Date().getTime() }
            await SignStates.updateOne({ _id: docuSignId }, { $set: { status: data.status } }).then(datas => {
                res.send({ msg: "status updated!", success: true, datas })
            }).catch(err => {
                res.send({ success: false, msg: "status not Updated!!", error: err.message.replace(/\"/g, "") });
            })
        }).catch(err => {
            res.send({ success: false, msg: "status not updated!!", error: err.message.replace(/\"/g, "") });
        })
    } catch (err) {
        res.send({ msg: "status not updated!", success: false, error: err.message.replace(/\"/g, "") });
    }
};


exports.getRequestSign = async (req, res) => {
    try {
        let docuSignId = req.params.docuSignId;
        let emailToken = req.params.emailToken;
        await SignStates.findOne({ _id: docuSignId }).then(async data => {
            let id = data.signDocForId;
            await buyMembership.findOne({ _id: id }).then(resp => {
                if (resp.emailToken === emailToken) {
                    let datas = {}
                    let ipAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
                    datas.ipAddress = ipAddress;
                    datas = { ...datas, ...data.toJSON() };
                    res.send({ msg: "data!", success: true, data: datas })
                } else {
                    res.status(401).send({ msg: "Not verified!", success: false });
                }

            }).catch(err => {
                res.send({ msg: "no Data!", success: false, error: err.message.replace(/\"/g, "") })
            })
        }).catch(err => {
            res.send({ msg: "no Data!", success: false, error: err.message.replace(/\"/g, "") })
        })
    } catch (err) {
        res.send({ msg: "no Data!", success: false, error: err.message.replace(/\"/g, "") });
    }
}

function getTextWidth(text, size = 14) {
    var width = pixelWidth(text, { size: size });
    return width
};

async function signPdf(file, items) {
    try {
        const { PDFDocument, rgb } = require('pdf-lib');
        //const fs = require('fs')
        const pdfDoc = await PDFDocument.load(file)
        for (let [owner, val] of Object.entries(items)) {
            for (let [_page, value] of Object.entries(val)) {
                const page = pdfDoc.getPages()[_page - 1]
                //console.log(value)
                for (let itm of value) {

                    if (itm.type == "sign" && itm.value) {
                        let img = await pdfDoc.embedPng(itm.value);
                        // const { width, height } = img.scale(1);
                        let x = (itm.x + 70) - (150 / 2)
                        let y = (page.getHeight() - (itm.y+24)) - (60 / 2)
                        page.drawImage(img, {
                            x: x,
                            y: y,
                            width: 150,
                            height: 60,
                        })
                    }
                    if (itm.type === 'date') {
                        let text = new Date().toLocaleDateString()
                        let x = (itm.x + 70) - (getTextWidth(text, 14) / 2)
                        let y = (page.getHeight() - (itm.y+24)) - (14 / 2)
                        page.drawText(new Date().toLocaleDateString(), {
                            x: x,
                            y: y,
                            size: 14,
                            color: rgb(0, 0., 0),
                        })
                    }
                    if (itm.type === 'text') {
                        let text = itm.value
                        let x = (itm.x + 70) - (getTextWidth(text, 14) / 2)
                        let y = (page.getHeight() - (itm.y+24)) - (14 / 2)
                        page.drawText(text, {
                            x: x,
                            y: y,
                            size: 14,
                            color: rgb(0, 0., 0),
                        })
                    }
                    if (itm.type === 'field') {
                        let text = itm.value
                        let x = (itm.x + 70) - (getTextWidth(text, 14) / 2)
                        let y = (page.getHeight() - (itm.y +24)) - (14 / 2)
                        page.drawText(text, {
                            x: x,
                            y: y,
                            size: 14,
                            color: rgb(0, 0., 0),
                        })
                    }
                }
            }
        }
        const pdfBytes = await pdfDoc.save()
        //fs.writeFileSync('./output.pdf', pdfBytes)
        return pdfBytes
    } catch (error) {
        console.log(error)
        throw error
    }
}

exports.primarySetSignItems = async (req, res) => {
    try {
        let docuSignId = req.params.docuSignId;
        let emailTokens = req.params.emailToken;
        let body = req.body;
        await SignStates.findOne({ _id: docuSignId }).then(async data => {
            // if (!data.status) data.status = {}
            // data.status[invite] = { ...data.status[invite], signed: new Date().getTime() };
            // let items = { ...data.items, ...req.body.items };
            let emailToken = await buyMembership.findOne({ _id: data.signDocForId });
            if (emailToken.emailToken === emailTokens) {
                await SignStates.updateOne({ _id: docuSignId }, { $set: body }).then(data => {
                    res.send({ msg: "Item updated!", success: true });
                }).catch(err => {
                    res.send({ msg: "Item not updated!", success: false, error: err.message.replace(/\"/g, "") });
                })
            } else {
                res.status(401).send({ msg: "Not verified!", success: false });
            }
        }).catch(err => {
            res.send({ msg: "not Updated!", success: false, error: err.message.replace(/\"/g, "") });
        })
    } catch (err) {
        res.send({ msg: "not Updated!", success: false, error: err.message.replace(/\"/g, "") });
    }
};


exports.setSignItems = async (req, res) => {
    try {
        let docuSignId = req.params.docuSignId;
        let emailTokens = req.params.emailToken;
        let body = req.body;
        // if (!data.status) data.status = {}
        // data.status[invite] = { ...data.status[invite], signed: new Date().getTime() };
        // let items = { ...data.items, ...req.body.items };
        let emailToken = await buyMembership.findOne({ _id: body.signDocForId });
        const pdfPath = emailToken.mergedDoc;
        let pdfLink = pdfPath.split(process.env.GOOGLE_STORAGE_PATH)[1]
        let docLink = `${process.env.RESET_URL}/docusign/sign/${docuSignId}/${pdfLink}/${emailTokens}`
        let aftersigncompleteLink = `${process.env.RESET_URL}/docusign/download/sign-pdf/${docuSignId}/${pdfLink}/${emailTokens}`


        if (emailToken.emailToken === emailTokens) {
            try {
                await SignStates.updateOne({ _id: docuSignId }, { $set: body }).then(async data => {
                    let items = await SignStates.findOne({ _id: docuSignId });
                    let emailArray = [];
                    let completedEmailArray = []
                    let ownerMail;
                    for (let [key, value] of Object.entries(items.items.toJSON())) {
                        for (let [k, v] of Object.entries(value)) {
                            for (let itmObj of v) {
                                if (key == "owner") {
                                    ownerMail = v[0].email;
                                }
                                if (itmObj.value === undefined || itmObj.value === "" || itmObj.value == null) {
                                    emailArray.push(itmObj.email);
                                } else {
                                    completedEmailArray.push(itmObj.email);
                                }
                            }
                        }
                    }
                    let uniqueEmail = [...new Set(emailArray)];
                    let completedMails = [...new Set(completedEmailArray)]
                    if (uniqueEmail.length) {
                        const emailData = new Mailer({
                            to: uniqueEmail,
                            from: ownerMail,
                            subject: "Please complete your Signature Process ✒️",
                            html: emailTemplateDocuSignUi('Click to Sign','Below is the PDF to complete your signature','Please, do not share this link to others',docLink),

                        });
                        emailData.sendMail()
                            .then(resp => {
                                res.send({ msg: "Item updated!", success: true });
                            })
                            .catch(err => {
                                res.send({ msg: "Item not updated!", success: false, error: err.message.replace(/\"/g, "") })
                            })
                    } else {
                        await SignStates.updateOne({ _id: docuSignId }, { $set: { isDone: true } })
                        const emailData = new Mailer({
                            to: completedMails,
                            from: ownerMail,
                            subject: "Signature Process Completed ",
                            html: emailTemplateDocuSignUi('Click to Download 📃','Document signature done 100%','Below completed Sign PDF',aftersigncompleteLink),
                        });
                        emailData.sendMail()
                            .then(resp => {
                                res.send({ msg: "Item updated!", success: true });
                            })
                            .catch(err => {
                                res.send({ msg: "Item not updated!", success: false, error: err.message.replace(/\"/g, "") })
                            })
                    }
                }).catch(err => {
                    res.send({ msg: "Item not updated!", success: false, error: err.message.replace(/\"/g, "") });
                })
            } catch (e) {
                console.error(e)
            }
        } else {
            res.status(401).send({ msg: "Not verified!", success: false });
        }

    } catch (err) {
        res.send({ msg: "not Updated!", success: false, error: err.message.replace(/\"/g, "") });
    }
};

exports.getSignItems = async (req, res) => {
    try {
        let docuSignId = req.params.docuSignId;
        let userId = req.params.userid;
        let emailToken = req.params.emailToken;
        await SignStates.findOne({ _id: docuSignId.trim() }).then(async resp => {
            let datas = resp.items;
            if (resp.signDocFor === 'membership') {
                try {
                    const data = await buyMembership.findOne({ _id: resp.signDocForId })
                    if (data.emailToken === emailToken) {
                        let response = await fetch(data.mergedDoc);
                        response = await response.buffer()
                        let pdfBuff = await buffToPdf(response);
                        const pdfs = await signPdf(pdfBuff, datas.toJSON());
                        let buffer = Buffer.from(pdfs).toString('base64');
                        res.send({ msg: "pdf buffer!", data: buffer, success: true });
                    } else { res.status(404).send({ msg: "Not authorized!", success: false }) }
                } catch (err) {
                    res.send({ msg: err.message.replace(/\"/g, ""), sucess: false });
                }
            } else {
                try {
                    const data = await buy_product.findOne({ _id: resp.signDocForId })
                    let pdfBuff = await buffToPdf(data.mergedDoc);
                    const pdfs = await signPdf(pdfBuff, datas.toJSON());
                    let buffer = Buffer.from(pdfs).toString('base64');
                    res.send({ msg: "pdf buffer!", data: buffer, success: true });
                } catch (err) {
                    res.send({ msg: err.message.replace(/\"/g, ""), sucess: false });
                }
            }
        })
    } catch (err) {
        res.send({ msg: "not Updated!", success: false, error: err.message.replace(/\"/g, "") });
    }
};

// exports.getMailSentHistory = async (req, res) => {

// }

exports.inviteeMailSent = async (req, res) => {
    try {
        let emailList = req.body.emails;
        let docLink = req.body.docLink;
        let ownerEmail = req.body.ownerEmail;
        const emailData = new Mailer({
            to: emailList,
            from: ownerEmail,
            subject: "Document Signature Process",
            // html: emailTemplateDocuSignUi('Click to Download 📃','Document signature done 100%','Below completed Sign PDF',aftersigncompleteLink),
            html: emailTemplateDocuSignUi('Click to Sign','Below is the PDF to complete your signature','Please, do not share this link to others',docLink),
        })
        emailData.sendMail()
            .then(resp => {
                res.send(resp)
            })
            .catch(err => {
                res.send(err)
            })

        // .then(resp => {
        //     res.send({ msg: "mail sent!", success: true })
        // }).catch(err => {
        //     res.send({ msg: err.message.replace(/\"/g, ""), error:err.stack , sucess: false });
        // })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), sucess: false });
    }
}

exports.getAllStudentDocs = async (req, res) => {
    let userId = req.params.userId;
    let buyMembershipId = req.params.buyMembershipId;

    //let objId = mongo.Types.ObjectId(studentId)
    try {
        let signStatesInfo = await SignStates.findOne({
            $and: [
                { userId: userId },
                { signDocForId: buyMembershipId }
            ]
        });
        if (signStatesInfo) {
            let buyMembersgipInfo = await buyMembership.findOne({ _id: buyMembershipId });
            let id = buyMembersgipInfo.membershipIds[0];
            let objId = mongo.Types.ObjectId(id)
            let membershipInfo = await membershipModal.findOne({ _id: objId });
            let obj = {};
            obj.mergedDocName = membershipInfo.membershipDocName;
            obj.mergedDoc = buyMembersgipInfo.mergedDoc;
            obj.emailToken = buyMembersgipInfo.emailToken;
            let data = { ...signStatesInfo.toJSON(), ...obj };
            res.send({ msg: "data", success: true, data: data });
        } else {
            res.send({ msg: "No buyMembership found!", success: false })
        }

        // await buyMembership.aggregate([
        //     {
        //         $match: {
        //             $and: [
        //                 { userId: userId },
        //                 {
        //                     studentInfo: {
        //                         $in:
        //                             [objId]
        //                     }
        //                 }
        //             ]

        //         }
        //     },
        //     {
        //         $project: {
        //             mergedDoc: 1
        //         }
        //     }
        // ]).then(async resp => {
        //     let data = await buy_product.aggregate([
        //         {
        //             $match: {
        //                 $and: [
        //                     { userId: userId },
        //                     {
        //                         studentInfo: {
        //                             $in:
        //                                 [objId]
        //                         }
        //                     }
        //                 ]

        //             }
        //         },
        //         {
        //             $project: {
        //                 mergedDoc: 1
        //             }
        //         }
        //     ])
        //     let datas = [...resp, ...data];
        //     let promise = [];
        //     for (let id in datas) {
        //         let ne = await SignStates.findOne({ signDocForId: datas[id]._id });
        //         if (ne && ne !== null) {
        //             let obj = {};
        //             obj.mergedDoc = datas[id].mergedDoc;
        //             let data = { ...ne.toJSON(), ...obj }
        //             promise.push(data);
        //         }
        //     }
        //     await Promise.all(promise)
        //     res.send({ msg: "data", data: promise, success: true })
        // }).catch(err => {
        //     res.send({ msg: err.message.replace(/\"/g, ""), sucess: false });
        // })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), sucess: false });
    }
}
