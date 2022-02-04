const SignStates = require("../models/signStates");
const sgMail = require("@sendgrid/mail");
const buyMembership = require("../models/buy_membership");
const buy_product = require("../models/buy_product");
const mongo = require('mongoose')



exports.addRequestSign = async (req, res) => {
    let userId = req.params.userId;
    try {
        let datas = { ...req.body, userId: userId }
        const signStat = new SignStates(datas)
        await signStat.save(function (err, data) {
            if (err) {
                res.send({ success: false, msg: "Info not added!!", error: err.message.replace(/\"/g, "") })
            } else {
                res.send({ data, success: true });
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
        await SignStates.find({ _id: docuSignId }).then(data => {
            res.send({ msg: "data!", success: true, data: data })
        }).catch(err => {
            res.send({ msg: "no Data!", success: false, error: err.message.replace(/\"/g, "") })
        })
    } catch (err) {
        res.send({ msg: "no Data!", success: false, error: err.message.replace(/\"/g, "") });
    }
}


exports.setSignItems = async (req, res) => {
    try {
        let docuSignId = req.params.docuSignId;
        let body = req.body;
        await SignStates.find({ _id: docuSignId }).then(async data => {
            // if (!data.status) data.status = {}
            // data.status[invite] = { ...data.status[invite], signed: new Date().getTime() };
            // let items = { ...data.items, ...req.body.items };
            await SignStates.updateOne({ _id: docuSignId }, { $set: body }).then(data => {
                res.send({ msg: "Item updated!", success: true });
            }).catch(err => {
                res.send({ msg: "Itme not updated!", success: false, error: err.message.replace(/\"/g, "") });
            })
        }).catch(err => {
            res.send({ msg: "not Updated!", success: false, error: err.message.replace(/\"/g, "") });
        })
    } catch (err) {
        res.send({ msg: "not Updated!", success: false, error: err.message.replace(/\"/g, "") });
    }
};

// exports.getMailSentHistory = async (req, res) => {

// }

exports.inviteeMailSent = async (req, res) => {
    try {
        let emailList = req.body.emailList;
        let docLink = req.body.docLink;
        let ownerEmail = req.body.ownerEmail
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const emailData = {
            to: emailList,
            from: ownerEmail,
            subject: "Document Signature Process",
            html: `<h2>Below is the PDF for your signature</h2>
                        <p>${docLink}</p>`,
        };
        console.log(emailData);
        sgMail
            .send(emailData, (err, resp) => {
                if (err) {
                    res.send(err)
                } else {
                    res.send(resp)
                }
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
    let studentId = req.params.studentId;
    let objId = mongo.Types.ObjectId(studentId)
    try {
        await buyMembership.aggregate([
            {
                $match: {
                    $and: [
                        { userId: userId },
                        {
                            studentInfo: {
                                $in:
                                    [objId]
                            }
                        }
                    ]

                }
            },
            {
                $project: {
                    mergedDoc: 1
                }
            }
        ]).then(async resp => {
            let data = await buy_product.aggregate([
                {
                    $match: {
                        $and: [
                            { userId: userId },
                            {
                                studentInfo: {
                                    $in:
                                        [objId]
                                }
                            }
                        ]

                    }
                },
                {
                    $project: {
                        mergedDoc: 1
                    }
                }
            ])
            let datas = [...resp, ...data];
            let promise = [];
            for (let id in datas) {
                let ne = await SignStates.findOne({ signDocForId: datas[id]._id });
                if (ne && ne !== null) {
                    let data = { ...ne.toJSON(), ...datas[id].toJSON() }
                    promise.push(data);
                }
            }
            await Promise.all(promise)
            res.send({msg:"data", data:promise, success:true})
        })
    } catch (err) {
        console.log(err)
    }
}
