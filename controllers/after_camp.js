const after_camp = require('../models/after_camp')

exports.get_after_camp = async (req, res) => {
    try {
        let adminId = process.env.ADMINID
        let userId = req.params.userId
        let after_camp_data = await after_camp.find({ $or: [{ userId: userId }, { adminId: adminId }] })
        res.send({ data: after_camp_data, success: true });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.get_admin_after_camp = async (req, res) => {
    try {
        let adminId = req.params.userId
        let after_camp_data = await after_camp.find({ adminId: adminId })
        res.send({ data: after_camp_data, success: true });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.create_after_camp = async (req, res) => {
    try {
        let userId = req.params.userId
        let adminId = req.params.adminId
        let after_camp_body = after_camp({
            after_camp_category: req.body.after_camp_category,
            userId: userId,
            adminId: adminId
        })
        await after_camp_body.save((err, after_camp_data) => {
            if (err) {
                res.send({ msg: err.message.replace(/\"/g, ""), success: false });

            } else {
                return res.send({ msg: "after_camp created successfully", success: true });
            }
        })

    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });

    }
}

exports.remove_after_camp = async (req, res) => {
    try {
        let after_campId = req.params.after_campId;
        const adminId = req.params.adminId;
        const userId = req.params.userId;
        await after_camp.findOneAndRemove(
            { _id: after_campId, $and: [{ userId: userId }, { adminId: adminId }] },
            (err, after_campId) => {
                if (err || !after_campId) {
                    return res.send({
                        msg: "This is system generated Tag Only admin can delete",
                        success: false,
                    })

                } else {
                    return res.send({ msg: "after_camp deleted successfully", success: true });
                }
            })

    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.Update_after_camp = async (req, res) => {
    try {
        let after_campId = req.params.after_campId;
        const adminId = req.params.adminId;
        const userId = req.params.userId;
        await after_camp
            .updateOne({ _id: after_campId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
            .exec((err, after_camp_data) => {
                if (err) {
                    res.send({ msg: "Tag not updated", success: false });

                } else {
                    if (after_camp_data.n < 1) {
                        return res.send({
                            msg: "This is system generated Tag Only admin can update",
                            success: false,
                        });
                    }
                    after_camp_data
                    return res.send({ msg: "after_camp updated successfully", success: true });
                }
            })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });

    }

}

