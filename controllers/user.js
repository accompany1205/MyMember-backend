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
  User.findByIdAndUpdate(userId, req.body)
    .exec((err, data) => {
      if (err) {
        res.send({
          success: false,
          error: "member is not update"
        });
      }
      else {
        if (req.file) {
          cloudUrl.imageUrl(req.file).then((subuserImgUrl) => {
            User.findByIdAndUpdate(userId, { $set: { profile_image: subuserImgUrl } })
              .then((response) => {
                res.json({ message: "your profile image updated successfully", success: true })
              }).catch((error) => {
                res.send({ error: 'sub user image is not update' })
              })
          }).catch((error) => {
            res.send({ error: 'image url is not create' })
          })
        }
        else {
          console.log(req.file)
          res.send({
            succe: true,
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



exports.deleteUser = async (req, res) => {
  try {

    userId = req.params.userId
    resp = await User.findByIdAndDelete(userId)
    res.send({ message: "User Deleted Successfullly", success: true })
    
  }
  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })

  }

};

exports.deleteMultiple_User= async (req, res) => {
  try {

    userIds = req.body.userId
    resp = await User.findByIdAndDelete(userId)
    res.send({ message: "User Deleted Successfullly", success: true })
    
  }
  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })

  }

};