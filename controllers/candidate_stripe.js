const { env } = require("process");
const candidate_stripe = require("../models/candidate_stripe");
const cloudUrl = require("../gcloud/imageUrl")
// var s = require("../uploads")

exports.candidate_create = (req, res) => {
    const Id = req.params.userId
    const stripeObj = new candidate_stripe({
        "candidateName": req.body.candidateName,
        "color": req.body.color,
        "lable": req.body.lable,
        "total_stripe": req.body.total_stripe,
        "progression": req.body.progression,
        "candidate": req.body.candidate
    })
    stripeObj.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        else {
            if (req.file) {
                cloudUrl.imageUrl(req.file).then((expimgUrl) => {
                    candidate_stripe.findByIdAndUpdate(data._id, { $set: { userId: Id, stripe_image: expimgUrl } })
                        .exec((err, updateStripe) => {
                            if (err) {
                                res.send({ error: 'image url is not add in stripe' })
                            }
                            else {
                                res.send({ msg: 'candidate is add with image successfully' })
                            }
                        })
                }).catch((error) => {
                    res.send({ error: 'candidate image url is not create' })
                })
            }
            else {
                candidate_stripe.findByIdAndUpdate({ _id: data._id }, { $set: { userId: Id } })
                    .exec((err, stripeData) => {
                        if (err) {
                            res.send({ error: 'user id is not add in stripe' })
                        }
                        else {
                            res.send(stripeData)
                        }
                    })
            }
        }
    });
};


exports.candidate_read = (req, res) => {
    candidate_stripe.find({ $or: [{ userId: req.params.userId }, { status: 'Admin' }] })
        .then((stripe) => {
            if (stripe.length > 0) {
                res.send(stripe)
            }
            else {
                res.send({ msg: 'candidate is empty' })
            }
        }).catch((err) => {
            res.send(err)
        })
};

exports.candidate_update = (req, res) => {
    const uid = req.params.candidateId;
    candidate_stripe.findByIdAndUpdate({ _id: uid }, req.body)
        .then((result) => {
            if (req.file) {
                cloudUrl.imageUrl(req.file).then((expimgUrl) => {
                    candidate_stripe.findByIdAndUpdate(result._id, { $set: { stripe_image: expimgUrl } })
                        .exec((err, updateStripe) => {
                            if (err) {
                                res.send({ error: 'image url is not add in stripe' })
                            }
                            else {
                                res.send({ error: 'candidate is update with image successfully' })
                            }
                        })
                }).catch((error) => {
                    res.send({ error: 'stripe image url is not create' })
                })
            } else {
                res.send({
                    msg: 'candidate is updated successfully',
                    status: "success"
                })
            }
        }).catch((err) => {
            res.send(err);
        });
}
exports.candidate_detail = (req, res) => {
    const id = req.params.candidateId
    candidate_stripe.findById(id)
        .select('candidateName')
        .populate('manage_stripe')
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        });
};

exports.candidate_remove = (req, res) => {
    try {
        var uid = req.params.candidateId;
        candidate_stripe.remove({ _id: uid })
            .then((resp) => {
                res.json({ success: true, message: "candidate deleted succesfuly" });
            }).catch((err) => {
                res.send({ error: err.message.replace(/\"/g, ""), success: false });
            })

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

};




