const summer_camp = require('../models/summer_camp')

exports.get_summer_camp = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }

        let summer_camp_data = await summer_camp.find({ userId: userId })
        res.send({ data: summer_camp_data, success: true });
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.create_summer_camp = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }
        let summer_camp_body = summer_camp({
            summer_camp_category: req.body.summer_camp_category,
            userId: userId
        })
        await summer_camp_body.save((err, summer_camp_data) => {
            if (err) {
                res.send({ error: err.message.replace(/\"/g, ""), success: false });

            } else {
                return res.send({ msg: "summer_camp created successfully", success: true });
            }
        })

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }
}

exports.remove_summer_camp = async (req, res) => {
    try {
        let summer_campId = req.params.summer_campId
        if (!summer_campId) {
            res.json({
                success: false,
                msg: "Please give the summer_campId  in params!"
            })
        }
        await summer_camp.findByIdAndRemove(summer_campId,
            ((err, summer_camp_data) => {
                if (err) {
                    return res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "summer_camp deleted successfully", success: true });
                }
            }))

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.Update_summer_camp = async (req, res) => {
    try {
        let summer_campId = req.params.summer_campId
        if (!summer_campId) {
            res.json({
                success: false,
                msg: "Please give the summer_campId  in params!"
            })
        }
        await summer_camp.findByIdAndUpdate(summer_campId, req.body,
            ((err, summer_camp_data) => {
                if (err) {
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "summer_camp updated successfully", success: true });
                }
            }))
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

