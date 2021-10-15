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



exports.update = (req, res) => {
    var userID = req.params.userID;
    User
      .findByIdAndUpdate({
        _id: userID
      }, req.body)
      .exec((err, data) => {
        if (err) {
          res.send({
            status: false,
            error: "User not updated"
          });
        } else {
          if (req.file) {
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
                      msg: "profile updated successfully"
                    });
                  })
                  .catch((error) => {
                    res.send({
                      error: "profile image not updated"
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
              msg: "profile updated successfully"
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
