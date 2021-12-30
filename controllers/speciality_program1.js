const speciality_program1 = require('../models/speciality_program1')

exports.get_speciality_program1 = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }

        let speciality_program1_data = await speciality_program1.find({ userId: userId })
        res.send({ data: speciality_program1_data, success: true });
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.create_speciality_program1 = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }
        let speciality_program1_body = speciality_program1({
            speciality_program1_category: req.body.speciality_program1_category,
            userId: userId
        })
        await speciality_program1_body.save((err, speciality_program1_data) => {
            if (err) {
                res.send({ error: err.message.replace(/\"/g, ""), success: false });

            } else {
                return res.send({ msg: "speciality_program1 created successfully", success: true });
            }
        })

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }
}

exports.remove_speciality_program1 = async (req, res) => {
    try {
        let speciality_program1Id = req.params.speciality_program1Id
        if (!speciality_program1Id) {
            res.json({
                success: false,
                msg: "Please give the speciality_program1Id  in params!"
            })
        }
        await speciality_program1.findByIdAndRemove(speciality_program1Id,
            ((err, speciality_program1_data) => {
                if (err) {
                    return res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "speciality_program1 deleted successfully", success: true });
                }
            }))

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.Update_speciality_program1 = async (req, res) => {
    try {
        let speciality_program1Id = req.params.speciality_program1Id
        if (!speciality_program1Id) {
            res.json({
                success: false,
                msg: "Please give the speciality_program1Id  in params!"
            })
        }
        await speciality_program1.findByIdAndUpdate(speciality_program1Id, req.body,
            ((err, speciality_program1_data) => {
                if (err) {
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "speciality_program1 updated successfully", success: true });
                }
            }))
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

