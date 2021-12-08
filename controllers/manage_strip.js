const { env } = require("process");
const manageCandidatesStripe = require("../models/manage_strip");
const candidate_stripe = require("../models/candidate_stripe");
const cloudenary = require("cloudinary").v2

exports.create = (req, res) => {
    const managestripe = new manageCandidatesStripe(req.body)
    managestripe.save((err, data) => {
        if (err) {
            res.send({ error: 'manage stripe is not add' })
        }
        else {
            if (req.file) {
                cloudenary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.cloud_api_key,
                    api_secret: process.env.cloud_api_secret
                });

                var filename = req.file.originalname;
                var path = req.file.path;
                var uniquefilename = filename + (Date.now())

                cloudenary.uploader.upload(
                    path,
                    { public_id: `manageStripe/${uniquefilename}`, tags: `manageStripe` }, // directory and tags are optional
                    function (err, image) {
                        if (err) return res.send(err)
                        const fs = require('fs')
                        fs.unlinkSync(path)
                        manageCandidatesStripe.findByIdAndUpdate(data._id, { $set: { manage_stripe_image: image.url } })
                            .exec((err, stripedata) => {
                                if (err) {
                                    res.send({ error: 'image is not add in manage stripe' })
                                }
                                else {
                                    candidate_stripe.updateOne({ candidateName: req.body.stripeName }, { $push: { "manageCandidatesStripe": data._id } })
                                        .exec((err, data) => {
                                            if (err) {
                                                res.send({ error: 'manage stripe is not add in stripe' })
                                            }
                                            else {
                                                res.send({ msg: 'manage stripe is add in stripe with image', data: stripedata })
                                            }
                                        })
                                }
                            })
                    }
                );
            }
            else {
                candidate_stripe.updateOne({ candidateName: req.body.stripeName }, { $push: { manageCandidatesStripe: data._id } })
                    .exec((err, stripe_data) => {
                        if (err) {
                            res.send({ error: 'manage stripe is not add in stripe' })
                        }
                        else {
                            res.send({ msg: 'manage stripe is add in stripe', data: data })
                        }
                    })
            }
        }
    });
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
    const manage_stripeId = req.params.manage_stripeId;
    manageCandidatesStripe.updateOne({ _id: manage_stripeId }, req.body)
        .then((result) => {
            if (req.file) {
                const cloudenary = require("cloudinary").v2
                cloudenary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.cloud_api_key,
                    api_secret: process.env.cloud_api_secret
                });

                var filename = req.file.originalname;
                var path = req.file.path;
                var uniquefilename = filename + (Date.now())

                cloudenary.uploader.upload(
                    path,
                    { public_id: `manageStripe/${uniquefilename}`, tags: `manageStripe` }, // directory and tags are optional
                    function (err, image) {
                        if (err) return res.send(err)
                        const fs = require('fs')
                        fs.unlinkSync(path)
                        manageCandidatesStripe.findByIdAndUpdate(manage_stripeId, { $set: { manage_stripe_image: image.url } })
                            .then((response) => {
                                res.send({ msg: 'manage stripe is update with image', success: true })
                            });
                    }
                );
            } else {
                res.send({ msg: 'stripe is updated', success: true })
            }
        }).catch((err) => {
            res.send(err);
        });
}
exports.manage_stripe_detail = (req, res) => {
    const manage_stripeId = req.params.manage_stripeId
    manageCandidatesStripe.findById(manage_stripeId)
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        });
};

exports.remove = (req, res) => {
    var manage_stripeId = req.params.manage_stripeId;
    manageCandidatesStripe.remove({ _id: manage_stripeId }, (err, data) => {
        if (err) {
            res.send({ error: 'manage stripe is not delete', success: false })
        }
        else {
            candidate_stripe.update({ "manage_stripe": manage_stripeId }, { $pull: { "manageCandidatesStripe": manage_stripeId } },
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
};







