const SignStates = require("../models/signStates");


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
        await SignStates.find({_id:docuSignId}).then(async data => {
            // if (!data.status) data.status = {}
            // data.status[invite] = { ...data.status[invite], signed: new Date().getTime() };
            // let items = { ...data.items, ...req.body.items };
            await SignStates.updateOne({ _id: docuSignId },{$set:body}).then(data => {
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
