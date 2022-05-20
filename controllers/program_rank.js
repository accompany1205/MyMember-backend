const program = require("../models/program");
const manage_rank = require("../models/program_rank");
const user = require("../models/user")
const cloudUrl = require("../gcloud/imageUrl")

exports.create = async (req, res) => {
    const rankBody = req.body
    rankBody.userId = req.params.userId;
    rankBody.adminId = req.params.adminId;
    let isExist = await program.find({ programName: rankBody.programName })
    try {
        if (isExist.length) {
            if (req.file) {
                await cloudUrl.imageUrl(req.file)
                    .then((result) => {
                        rankBody.rank_image = result

                    })
                    .catch((err) => {
                        res.send({ msg: err.message.replace(/\"/g, ""), success: false })

                    })
            }
            let prog = new manage_rank(rankBody)
            prog.save((err, data) => {
                if (err) {
                    res.send({ msg: err, success: false })
                }
                else {
                    program.updateOne({ programName: req.body.programName }, { $push: { program_rank: data._id } })
                        .exec((err, programdata) => {
                            if (err) {
                                res.send({ msg: err, success: false })
                            }
                            else {
                                res.send({ msg: 'rank added successfully', success: true })
                            }
                        })

                }
            })
        }
        else {
            res.send({ msg: "Program does not exist!", success: false })
        }
    }


    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}


exports.read = (req, res) => {
    // const uid = req.body.uid;
    manage_rank.find()
        .then((category) => {
            res.json(category)
        }).catch((err) => {
            res.send(err)
        })
};

exports.program_Info = async (req, res) => {
    const id = req.params.program_rank_id;
    manage_rank.findById(id)
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        });
};
exports.update = async (req, res) => {
    const program_rank_id = req.params.program_rank_id;
    const adminId = req.params.adminId
    const userId = req.params.userId;

    const rankBody = req.body
    console.log(rankBody)
    console.log(program_rank_id + " " + adminId + " " + userId);
    let isExist = await program.find({ programName: rankBody.programName })
    try {
        if (isExist.length) {
            if (req.file) {
                await cloudUrl.imageUrl(req.file)
                    .then((result) => {
                        rankBody.rank_image = result
                    })
                    .catch((err) => {
                        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
                    })
            }
            await manage_rank.updateOne({ _id: program_rank_id, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: rankBody })
                .exec((err, data) => {
                    if (err) {
                        res.send({ msg: err, success: false })
                    }
                    else {
                        console.log(data.n)
                        if (data.n < 1) {
                            return res.send({
                                msg: "This is system generated Rank Only admin can update",
                                success: false,
                            });
                        }
                        res.send({ msg: 'rank updated successfully', success: true })
                    }
                })
        }
        else {
            res.send({ msg: "Program does not exist!", success: false })
        }
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}


exports.remove = async (req, res) => {
    try {
        const program_rank_id = req.params.program_rank_id;
        const adminId = req.params.adminId
        const userId = req.params.userId;
        manage_rank.remove({ _id: program_rank_id, $and: [{ userId: userId }, { adminId: adminId }] }, async (err, data) => {
            if (err) {
                res.send({ msg: 'Rank not removed', success: false })
            }
            else {
                if (!data) {
                    return res.send({
                        msg: "This is system generated Rank Only admin can delete",
                        success: false,
                    });
                }
                await program.updateOne({ "program_rank": program_rank_id }, { $pull: { "program_rank": program_rank_id } },
                    function (err, data) {
                        if (err) {
                            res.send({ msg: 'Rank not removed', success: false })
                        }
                        else {
                            res.send({ msg: 'Rank removed successfully', success: true })
                        }
                    })
            }
        })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
};


