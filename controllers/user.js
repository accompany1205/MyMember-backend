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
    var userId = req.params.userId;
    console.log(req.body)
    User
      .findByIdAndUpdate({
        _id: userId
      }, req.body)
      .exec((err, data) => {
          console.log(data)
        if (err) {
          res.send({
            status: false,
            error: "member is not update"
          });
        } else {
          if (req.file) {
              console.log(">>>>>>>>>>>>>>>>",req.file)
            cloudUrl
              .imageUrl(req.file)
              .then((stdimagUrl) => {
                User
                  .findByIdAndUpdate(data._id, {
                    $set: {
                        profile_image: stdimagUrl
                    },
                  })
                  .then((response) => {
                    res.send({
                      msg: "profile image is update"
                    });
                  })
                  .catch((error) => {
                    res.send({
                      error: "student image is not update"
                    });
                  });
              })
              .catch((error) => {
                res.send({
                  status: false,
                  error: "image url is not create"
                });
              });
          } else {
            res.send({
              status: true,
              msg: "profile is update successfully"
            });
          }
        }
      });
  };












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
