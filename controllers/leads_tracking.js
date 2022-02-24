const leadsTracking = require('../models/leads_tracking')

exports.get_leads = async (req, res) => {
    try {
        let adminId = process.env.ADMINID
        let userId = req.params.userId
        let leads_data = await leadsTracking.find({ $or: [{ userId: userId }, { adminId: adminId }] })
        res.send({ data: leads_data, success: true });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.get_adminleads = async (req, res) => {
    try {
        let adminId = req.params.adminId
        let leads_data = await leadsTracking.find({ adminId: adminId })
        res.send({ data: leads_data, success: true });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.create_leads = async (req, res) => {
    try {
        let userId = req.params.userId;
        let adminId = req.params.adminId;
        let leads_body = leadsTracking({
            leads_category: req.body.leads_category,
            userId: userId,
            adminId: adminId
        })
        await leads_body.save((err, leads_data) => {
            if (err) {
                res.send({ msg: err.message.replace(/\"/g, ""), success: false });

            } else {
                return res.send({ msg: "leads created successfully", success: true });
            }
        })

    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });

    }
}

exports.remove_leads = async (req, res) => {
    try {
        let leadsId = req.params.leadsId;
        const adminId = req.params.adminId;
        const userId = req.params.userId;
        await leadsTracking.findOneAndRemove(
            { _id: leadsId, $and: [{ userId: userId }, { adminId: adminId }] },
            (err, leads_data) => {
                if (err || !leads_data) {
                    return res.send({
                        msg: "This is system generated Tag Only admin can delete",
                        success: false,
                    })

                } else {
                    return res.send({ msg: "leads deleted successfully", success: true });
                }
            })

    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.Update_leads = async (req, res) => {
    try {
        let leadsId = req.params.leadsId;
        const adminId = req.params.adminId;
        const userId = req.params.userId;
        await leadsTracking
            .updateOne({ _id: leadsId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
            .exec((err, leads_data) => {
                if (err) {
                    res.send({ msg: err.message.replace(/\"/g, ""), success: false });

                } else {
                    if (leads_data.n < 1) {
                        return res.send({
                            msg: "This is system generated Lead Only admin can update",
                            success: false,
                        });
                    }
                    return res.send({ msg: "lead updated successfully", success: true });
                }
            })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });

    }

}

