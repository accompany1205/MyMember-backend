const program = require("../models/program");
const manage_rank = require("../models/program_rank");
const user = require("../models/user")
const cloudUrl = require("../gcloud/imageUrl")

exports.create = async (req, res) => {
    const rankBody = req.body
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


    const rankBody = req.body
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
            await manage_rank.updateOne({ _id: program_rank_id }, { $set: rankBody })
                .exec((err, data) => {
                    if (err) {
                        res.send({ msg: err, success: false })
                    }
                    else {
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
        manage_rank.remove({ _id: program_rank_id }, async (err, data) => {
            if (err) {
                res.send({ msg: 'program rank not deleted', success: false })
            }
            else {
                await program.updateOne({ "program_rank": program_rank_id }, { $pull: { "program_rank": program_rank_id } },
                    function (err, data) {
                        if (err) {
                            res.send({ msg: 'Rank not removed  ', success: false })
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


