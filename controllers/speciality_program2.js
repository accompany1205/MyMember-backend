const speciality_program2 = require('../models/speciality_program2')

exports.get_speciality_program2 = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }

        let speciality_program2_data = await speciality_program2.find({ userId: userId })
        res.send({ data: speciality_program2_data, success: true });
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.create_speciality_program2 = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }
        let speciality_program2_body = speciality_program2({
            speciality_program2_category: req.body.speciality_program2_category,
            userId: userId
        })
        await speciality_program2_body.save((err, speciality_program2_data) => {
            if (err) {
                res.send({ error: err.message.replace(/\"/g, ""), success: false });

            } else {
                return res.send({ msg: "speciality_program2 created successfully", success: true });
            }
        })

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }
}

exports.remove_speciality_program2 = async (req, res) => {
    try {
        let speciality_program2Id = req.params.speciality_program2Id
        if (!speciality_program2Id) {
            res.json({
                success: false,
                msg: "Please give the speciality_program2Id  in params!"
            })
        }
        await speciality_program2.findByIdAndRemove(speciality_program2Id,
            ((err, speciality_program2_data) => {
                if (err) {
                    return res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "speciality_program2 deleted successfully", success: true });
                }
            }))

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.Update_speciality_program2 = async (req, res) => {
    try {
        let speciality_program2Id = req.params.speciality_program2Id
        if (!speciality_program2Id) {
            res.json({
                success: false,
                msg: "Please give the speciality_program2Id  in params!"
            })
        }
        await speciality_program2.findByIdAndUpdate(speciality_program2Id, req.body,
            ((err, speciality_program2_data) => {
                if (err) {
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "speciality_program2 updated successfully", success: true });
                }
            }))
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

