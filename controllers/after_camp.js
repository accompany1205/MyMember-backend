const after_camp = require('../models/after_camp')

exports.get_after_camp = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }

        let after_camp_data = await after_camp.find({ userId: userId })
        res.send({ data: after_camp_data, success: true });
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.create_after_camp = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }
        let after_camp_body = after_camp({
            after_camp_category: req.body.after_camp_category,
            userId: userId
        })
        await after_camp_body.save((err, after_camp_data) => {
            if (err) {
                res.send({ error: err.message.replace(/\"/g, ""), success: false });

            } else {
                return res.send({ msg: "after_camp created successfully", success: true });
            }
        })

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }
}

exports.remove_after_camp = async (req, res) => {
    try {
        let after_campId = req.params.after_campId
        if (!after_campId) {
            res.json({
                success: false,
                msg: "Please give the after_campId  in params!"
            })
        }
        await after_camp.findByIdAndRemove(after_campId,
            ((err, after_camp_data) => {
                if (err) {
                    return res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "after_camp deleted successfully", success: true });
                }
            }))

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.Update_after_camp = async (req, res) => {
    try {
        let after_campId = req.params.after_campId
        if (!after_campId) {
            res.json({
                success: false,
                msg: "Please give the after_campId  in params!"
            })
        }
        await after_camp.findByIdAndUpdate(after_campId, req.body,
            ((err, after_camp_data) => {
                if (err) {
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "after_camp updated successfully", success: true });
                }
            }))
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

