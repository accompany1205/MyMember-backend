const User = require('../models/user');
const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');
const navbar = require('../models/navbar.js')
const cloudUrl = require("../gcloud/imageUrl")


exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user;
        next();
    });
};

exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};

// exports.update = (req, res) => {
//     req.body.role = 0; // role will always be 0
//     User.findOneAndUpdate({ _id: req.profile._id }, { $set: req.body }, { new: true }, (err, user) => {
//         if (err) {
//             return res.status(400).json({
//                 error: 'You are not authorized to perform this action'
//             });
//         }
//         user.hashed_password = undefined;
//         user.salt = undefined;
//         res.json(user);
//     });
// };

// exports.update = (req, res) => {
//     const id = req.params.userId;
//     User.updateOne({ _id: id }, req.body).exec((err, data) => {
//         if (err) {
//             res.send(err)
//         }
//         else {

//             res.send({ message: "User updated successfully", success: true })

//         }
//     })
// }

exports.update = (req, res) => {
    const id = req.params.userId;
    User.updateOne({ _id: id }, req.body)
        .then((result) => {
            if (req.file) {
                const cloudenary = require("cloudinary").v2
                cloudenary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.cloud_api_key,
                    api_secret: process.env.cloud_api_secret
                });
                const path = req.file.path
                const uniqueFilename = new Date().toISOString()
                cloudenary.uploader.upload(
                    path,
                    { public_id: `school_profile/${uniqueFilename}`, tags: `school_profile` }, // directory and tags are optional
                    function (err, image) {
                        if (err) return res.send(err)
                        const fs = require('fs')
                        fs.unlinkSync(path)
                        User.findByIdAndUpdate(id, { $set: { profile_image: image.url } })
                            .then((response) => {
                                res.json({ msg: 'Profile updated successfully !', success:true })
                            });
                    }
                );
            } else {
                res.send({ msg: 'Profile updated successfully !', success:true });
            }
            // res.send(result);
        }).catch((err) => {
            res.send(err);
        })
}










exports.addOrderToUserHistory = (req, res, next) => {
    let history = [];

    req.body.order.products.forEach(item => {
        history.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.count,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
        });
    });

    User.findOneAndUpdate({ _id: req.profile._id }, { $push: { history: history } }, { new: true }, (error, data) => {
        if (error) {
            return res.status(400).json({
                error: 'Could not update user purchase history'
            });
        }
        next();
    });
};

exports.purchaseHistory = (req, res) => {
    Order.find({ user: req.profile._id })
        .populate('user', '_id name')
        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(orders);
        });
};
