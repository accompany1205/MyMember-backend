const { env } = require("process");
const candidate_stripe = require("../models/candidate_stripe");
const cloudUrl = require("../gcloud/imageUrl")

exports.candidate_create = async (req, res) => {
    try {
        const candidateBody = req.body
        candidateBody.userId = req.params.userId;
        candidateBody.adminId = req.params.adminId;
        if (req.file) {
            await cloudUrl.imageUrl(req.file)
                .then((expimgUrl) => {
                    candidateBody.candidate_image = expimgUrl
                })
                .catch((error) => {
                    res.send({ msg: 'candidate image url  not created', success: false })
                })
        }
        const stripeObj = new candidate_stripe(candidateBody)
        stripeObj.save((err, data) => {
            if (err) {
                return res.status(400).send({
                    msg: err.message.replace(/\"/g, ""),
                    success: false
                });
            }
            else {
                res.send({ msg: "Candidate created successfully", success: true })

            }
        })
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.candidate_read = (req, res) => {
    const adminId = process.env.ADMINID
    const userId = req.params.userId
    try {
        candidate_stripe.find({ $or: [{ userId: userId }, { adminId: adminId }] })
            .populate("stripes")
            .then((stripe) => {
                if (stripe.length > 0) {
                    res.send({ data: stripe, success: true })
                }
                else {
                    res.send({ msg: 'candidate is empty', success: false })
                }
            }).catch((err) => {
                res.send(err)
            })
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.candidate_readAdmin = (req, res) => {
    const adminId = req.params.adminId
    try {
        candidate_stripe.find({ adminId: adminId })
            .populate("stripes")
            .then((stripe) => {
                if (stripe.length > 0) {
                    res.send({ data: stripe, success: true })
                }
                else {
                    res.send({ msg: 'candidate is empty', success: false })
                }
            }).catch((err) => {
                res.send(err)
            })
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.candidate_update = async (req, res) => {
    try {
        const candidateBody = req.body
        const candidateId = req.params.candidateId;
        const adminId = req.params.adminId
        const userId = req.params.userId;
        if (req.file) {
            await cloudUrl.imageUrl(req.file)
                .then((expimgUrl) => {
                    candidateBody.candidate_image = expimgUrl
                })
                .catch((error) => {
                    res.send({ msg: 'candidate image url not created', success: false })
                })
        }
        candidate_stripe.updateOne({ _id: candidateId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: candidateBody })
            .exec(async (err, updateData) => {
                if (err) {
                    res.send({ msg: 'candidate already exist!', success: err })
                }
                else {
                    if (updateData.n < 1) {
                        return res.status(401).send({
                            msg: "This is system generated membership Only admin can update",
                            success: false,
                        });
                    }
                    res.send({
                        msg: 'candidate updated successfully',
                        success: true
                    })
                }
            })
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.candidate_detail = (req, res) => {
    try {
        const id = req.params.candidateId
        candidate_stripe.findById(id)
            .select('candidate')
            .populate('stripes')
            .then((result) => {
                res.json(result)
            }).catch((err) => {
                res.send(err)
            });
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

};

exports.candidate_remove = async (req, res) => {
    try {
        var candidateId = req.params.candidateId;
        const adminId = req.params.adminId
        const userId = req.params.userId;
        candidate_stripe.findOneAndRemove
            ({ _id: candidateId, $and: [{ userId: userId }, { adminId: adminId }] })
            .exec((err, data) => {
                if (err) {
                    res.send({ msg: 'Candidate  not removed', success: false })
                }
                else {
                    if (!data) {
                        return res.status(401).send({
                            msg: "This is system generated membership Only admin can delete",
                            success: false,
                        });
                    }
                    res.send({
                        msg: "Candidate removed  successfully",
                        success: true,
                    });
                }
            })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

};




