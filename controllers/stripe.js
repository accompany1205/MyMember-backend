const { env } = require("process");
const stripe = require("../models/stripe");
const candidate_stripe = require("../models/candidate_stripe");
const cloudUrl = require("../gcloud/imageUrl")

exports.create = (req, res) => {
    try {
        const Id = req.params.userId
        const managestripe = new stripe(req.body)
        managestripe.save((err, data) => {
            if (err) {
                res.send({ error: 'manage stripe is not add' })
            }
            else {
                if (req.file) {
                    cloudUrl.imageUrl(req.file).then((expimgUrl) => {
                        stripe.findByIdAndUpdate(data._id, { $set: { userId: Id, stripe_image: expimgUrl } })
                            .exec((err, updateStripe) => {
                                if (err) {
                                    res.send({ error: 'image url is not add in stripe', success: false })
                                }
                                else {
                                    candidate_stripe.updateOne({ candidate: req.body.candidate }, { $push: { stripes: data._id } })
                                    .exec((err, stripe_data) => {
                                        if (err) {
                                            res.send({ error: 'stripe is not add in stripe' })
                                        }
                                        else {
                                            res.send({ msg: 'stripe is add with image successfully', success: true })
                                        }
                                    })
                                }
                            })
                    }).catch((error) => {
                        res.send({ error: 'stripe image url is not create', success: false })
                    })
                }
                else {
                    candidate_stripe.updateOne({ candidate: req.body.candidate }, { $push: { stripes: data._id } })
                        .exec((err, stripe_data) => {
                            if (err) {
                                res.send({ error: 'stripe is not add in stripe' })
                            }
                            else {
                                res.send({ msg: 'stripe is add in stripe', data: data })
                            }
                        })
                }
            }
        });

    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

};

// exports.read = (req, res) => {
//     // const uid = req.body.uid;
//     stripe.find()
//         .then((category) => {
//             res.json(category)
//         }).catch((err) => {
//             res.send(err)
//         })
// };

exports.update = (req, res) => {
    try {
        const stripeId = req.params.stripeId;
        stripe.updateOne({ _id: stripeId }, req.body)
            .then((result) => {
                if (req.file) {
                    cloudUrl.imageUrl(req.file).then((expimgUrl) => {
                        stripe.findByIdAndUpdate(data._id, { $set: { userId: Id, stripe_image: expimgUrl } })
                            .exec((err, updateStripe) => {
                                if (err) {
                                    res.send({ error: 'image url is not add in stripe', success: false })
                                }
                                else {
                                    res.send({ msg: 'stripe is add with image successfully', success: true })
                                }
                            })
                    }).catch((error) => {
                        res.send({ error: 'stripe image url is not create', success: false })
                    })
                } else {
                    res.send({ msg: 'stripe is updated', success: true })
                }
            }).catch((err) => {
                res.send(err);
            });
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }

}
exports.manage_stripe_detail = (req, res) => {
    try {
        const stripeId = req.params.stripeId
        stripe.findById(stripeId)
            .then((result) => {
                res.send({ result, success: true })
            }).catch((err) => {
                res.send(err)
            });
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

};

exports.remove = (req, res) => {
    try {
        var stripeId = req.params.stripeId;
        stripe.remove({ _id: stripeId }, (err, data) => {
            if (err) {
                res.send({ error: 'manage stripe is not delete', success: false })
            }
            else {
                candidate_stripe.update({ "stripes": stripeId }, { $pull: { "stripes": stripeId } },
                    function (err, data) {
                        if (err) {
                            res.send({ error: 'manage stripe is not delete from stripe', success: false })
                        }
                        else {
                            res.send({ msg: 'stripe is deleted ', success: true })
                        }
                    })
            }
        })
    } catch (err) {

    }

};







