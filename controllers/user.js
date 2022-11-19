const User = require('../models/user');
const UserPakages = require('../models/user_pakages')
const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');
const navbar = require('../models/navbar.js')
const cloudUrl = require("../gcloud/imageUrl")
const request = require("request");
const mergeFile = require('../Services/mergeFile');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

exports.userById = (req, res, next, id) => {
  User
    .findById(id)
    .populate('locations')
    .populate('default_location')
    .populate('userPakages')

    // .populate('subUsers')
    // .populate('mainUser')
    .exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          msg: 'User not found',
          success: "false"
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



exports.socialAuth = async (req, res) => {
  try {
    let userId = req.params.userId;
    const socialData = req.body;
    const data = await User.updateOne({ _id: userId }, { $set: socialData })
    if (data.nModified === 1) {
      return res.send({ msg: "updated!", success: true })
    }
    return res.send({ msg: "not Updated!", success: false });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.update = async (req, res) => {
  let userId = req.params.userId;
  let body = req.body
  try {
    if (req.file) {
      await cloudUrl.imageUrl(req.file)
        .then((subuserImgUrl) => {
          body.profile_image = subuserImgUrl

        }).catch((error) => {
          res.send({ msg: 'image url nor created', success: false })
        })
    }
    User.findByIdAndUpdate(userId, { $set: body })
      .exec((err, data) => {
        if (err) {
          res.send({
            msg: err,
            success: false,
          });
        } else {
          res.send({
            success: true,
            msg: "User updated successfully!"
          });
        };
      })
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
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

exports.userSignatureUpdate = async (req, res) => {
  let userId = req.params.userId;
  let signature = req.body.signature;
  try {
    User.findOneAndUpdate({ _id: userId }, { $set: { signature: signature } })
      .then(resp => {
        res.send({ msg: "signature Updated!", success: true })
      }).catch(err => {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
      });

  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

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

exports.mergeUserInfo = async (req, res) => {
  try {
    let docBody = req.body.docUrl;
    let userId = req.params.userId;
    const userInfo = await User.findOne({ _id: userId });
    if (userInfo) {
      var mergedInfo = { ...userInfo.toJSON() }
      let fileObj = await mergeFile(docBody, mergedInfo)
      cloudUrl.imageUrl(fileObj)
        .then(data => {
          res.send({ msg: "get merged doc", success: true, data: data })
        })
        .catch(err => {
          res.send({ msg: "data not found", success: false });
        })

    } else {
      res.send({ msg: "User not found!", success: false })
    }

  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false });
  }
};
exports.purchased_Num = async (req, res) => {
  try {
    // let {} = req.body
    //  console.log('req body', req.body)
    //  console.log('req params', req.params)
    await client.incomingPhoneNumbers
      .create({ phoneNumber: req.body.purchased_Num })
      .then(incoming_phone_number =>
        console.log(incoming_phone_number.sid)
      );
    let UserInfo = await User.findByIdAndUpdate(req.params.userid, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      success: true,
      data: UserInfo
    })
  } catch (error) {
    console.log('purchase num err', error)
  }
}

exports.Subtract_Credits = async (req, res) => {
  try {
    // let {} = req.body
    console.log('req body', req.body)
    console.log('req params', req.params)
    let creditsInfo = await UserPakages.findByIdAndUpdate(req.params.userid, { $inc: { credits: -1 } }, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      success: true,
      data: creditsInfo
    })
  } catch (error) {
    console.log('purchase num err', error)
  }
}
exports.Add_Credits = async (req, res) => {
  try {
    let { credits } = req.body
    console.log('req body', req.body, credits)
    console.log('req params', req.params)
    let creditsInfo = await UserPakages.findByIdAndUpdate(req.params.userid, { $inc: { credits: credits ? credits : 1 } }, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      success: true,
      data: creditsInfo
    })
  } catch (error) {
    console.log('purchase num err', error)
  }
}
exports.AddNew_Credits = async (req, res) => {
  try {
    // let {} = req.body
    console.log('req body', req.body)
    let newData = await UserPakages(req.body).save()
      .then((item) => res.json({ success: true, data: item }))
    //  let creditsInfo = await UserPakages.findByIdAndUpdate(req.params.userid , {$inc:{credits: 1}} ,{
    //   new: true,
    //   runValidators:true
    //  })
    res.status(200).json({
      success: true,
      data: creditsInfo
    })
  } catch (error) {
    console.log('purchase num err', error)
  }
}