const program = require("../models/program");


exports.create = async (req, res) => {
    try {
        const programBody = req.body
        programBody.userId = req.params.userId;
        programBody.adminId = req.params.adminId;
        let isExist = await program.find({ programName: programBody.programName })
        if (!isExist.length) {
            var prog = new program(programBody)
            prog.save((err, data) => {
                if (err) {
                    res.send({ msg: 'program not created', success: false })
                }
                else {
                    res.send({ msg: 'Program created successfully ', success: true })
                }
            })
        }
        else {
            res.send({ msg: "Program alredy exist!", success: false })
        }

    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
};

exports.read = (req, res) => {
    const adminId = process.env.ADMINID
    const userId = req.params.userId
    try {
        program.find({ $or: [{ userId: userId }, { adminId: adminId }] })
            .populate({
                path: 'program_category',
                populate: {
                    path: 'program_subcategory',
                    model: 'psubcategory'
                }
            })
            .populate('program_rank')
            .exec((err, programdata) => {
                if (err) {
                    res.send({ error: 'program is not found' })
                }
                else {
                    res.send({ data: programdata, success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
};


exports.readAdmin = (req, res) => {
    const adminId = req.params.adminId
    try {
        program.find({ adminId: adminId })
            .populate({
                path: 'program_category',
                populate: {
                    path: 'program_subcategory',
                    model: 'psubcategory'
                }
            })
            .populate('program_rank')
            .exec((err, programdata) => {
                if (err) {
                    res.send({ error: 'program is not found' })
                }
                else {
                    res.send({ data: programdata, success: true })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
};
exports.programs_detail = (req, res) => {
    var id = req.params.proId
    program.findById(id)
        .populate('program_category')
        .populate('program_rank')
        .exec((err, data) => {
            if (err) {
                res.send({ error: 'category is not populate' })
            }
            else {
                res.send(data)
            }
        })

};

exports.program_rank = (req, res) => {
    var id = req.params.proId
    program.findById(id)
        .select('programName')
        .populate('program_rank')
        .exec((err, data) => {
            if (err) {
                res.send({ error: 'rank is not populate' })
            }
            else {
                res.send(data)
            }
        })
};

exports.update = async (req, res) => {
    const programId = req.params.proId;
    const adminId = req.params.adminId
    const userId = req.params.userId;
    try {
        program.updateOne({ _id: programId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
            .exec(async (err, updateData) => {
                if (err) {
                    res.send({ msg: err, success: false })
                }
                else {
                    if (updateData.n < 1) {
                        return res.status(401).send({
                            msg: "This is system generated membership Only admin can update",
                            success: false,
                        });
                    }
                    res.send({ msg: "programm updated succesfully", success: true });

                }
            })


    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}


exports.remove = (req, res) => {
    const programId = req.params.proId;
    const adminId = req.params.adminId
    const userId = req.params.userId;
    try {
        program.findOneAndRemove
            ({ _id: programId, $and: [{ userId: userId }, { adminId: adminId }] })
            .exec((err, data) => {
                if (err) {
                    res.send({ msg: 'product  not removed', success: false })
                }
                else {
                    if (!data) {
                        return res.status(401).send({
                            msg: "This is system generated membership Only admin can delete",
                            success: false,
                        });
                    }
                    res.send({
                        msg: "product removed  successfully",
                        success: true,
                    });

                }
            })

    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
};




