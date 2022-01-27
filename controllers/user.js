const User = require('../models/user');
const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');
const navbar = require('../models/navbar.js')
const cloudUrl = require("../gcloud/imageUrl")
const request = require("request");



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

exports.verificationLink = async (req, res) => {
  let userId = req.params.userId;
  let link = req.body.link;
  let email = req.body.email;
  try {
    await User.updateOne({ _id: userId, "sendgridVerification.email": email },
      { $set: { "sendgridVerification.$.link": link } }
    ).then((resp) => {
      res.send({ msg: "Request sent for verification to admin!!", success: true, resp })
    }).catch((error) => {
      res.send({ msg: "Request not send to Admin!", success: false, error })
    })
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.listingVerifications = async (req, res) => {
  let userId = req.params.userId;
  try {
    await User.findById(userId, { sendgridVerification: 1, _id: 0 }).then(resp => {
      res.send({ msg: "data!", resp, success: true })
    }).catch(err => {
      res.send({ msg: "not Data!", success: false, err })
    })
  } catch (error) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.deleteVerifiedSendgridUser = async (req, res) => {
  try {
    let userId = req.params.userId;
    let key = process.env.SENDGRID_API_KEY;
    let email = req.params.email;
    var options = {
      method: 'GET',
      url: 'https://api.sendgrid.com/v3/verified_senders',
      headers: { authorization: `Bearer ${key}` },
      body: '{}'
    };
    getverifiedSendgrid(options).then(data => {
      let currentEmail;
      data.results.map(ele => {
        if (email === ele.from_email) {
          currentEmail = ele.id
        }
      })
      var option = {
        method: 'DELETE',
        url: `https://api.sendgrid.com/v3/verified_senders/${currentEmail}`,
        headers: { authorization: `Bearer ${key}` },
        body: '{}'
      };
      deleteVerifiedSendgridUser(option).then(resp => {
        User.updateOne({ _id: userId }, { $pull: { sendgridVerification: { email: email } } }).then(respon => {
          res.send(respon);
        }).catch(err => {
          res.send({ error: err.message.replace(/\"/g, ""), success: false });
        })
      }).catch(err => {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
      })
    }).catch(err => {
      res.send({ error: err.message.replace(/\"/g, ""), success: false })
    })
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }

}

function deleteVerifiedSendgridUser(option) {
  return new Promise((resolve, reject) => {
    request(option, function (error, response, body) {
      if (error) {
        reject({ msg: "User Email not deleted!", success: false, error })
      } else {
        resolve({ msg: "deleted successfuly!", success: true })
      }
    });
  })
}
function getverifiedSendgrid(options) {
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject({ error })
      } else {
        resolve(JSON.parse(body))
      }

    });
  })
}

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

exports.deleteMultiple_User = async (req, res) => {
  try {

    userIds = req.body.userId
    resp = await User.findByIdAndDelete(userId)
    res.send({ message: "User Deleted Successfullly", success: true })

  }
  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })

  }

};