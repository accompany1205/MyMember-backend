const user = require("../../models/user");
const sgMail = require("sendgrid-v3-node");
const cloudUrl = require("../../gcloud/imageUrl");
const bcrypt = require('bcryptjs');


exports.user_List = (req, res) => {
  user
    .find({
      role: 0,
    })
    .populate("user_membership_details", "membershipName startDate expiry_date")
    .exec((err, userList) => {
      if (err || !userList) {
        res.send({
          error: "user list not found",
        });
      } else {
        res.send(userList);
      }
    });
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
exports.school_list = (req, res) => {
  user
    .find(
      {
        role: 0,
      },
      {
        status: 1,
        firstname: 1,
        username: 1,
        email: 1,
        phone: 1,
        password: 1,
        location: 1,
      }
    )
    .exec((err, userList) => {
      if (err || !userList) {
        res.send({
          error: "user list not found",
        });
      } else {
        res.send(userList);
      }
    });
};

exports.userInfo = (req, res) => {
  user
    .findOne({
      _id: req.params.userId,
    })
    .populate("user_membership_details")
    .exec((err, userinfo) => {
      if (err) {
        res.send({
          error: "user info not found",
        });
      } else {
        res.send(userinfo);
      }
    });
};

exports.create_user = (req, res) => {
  var userObj = new user(req.body);
  userObj.save(function (err, User) {
    if (err) {
      res.send(err);
    } else {
      if (req.file) {
        cloudUrl
          .imageUrl(req.file)
          .then((subuserImgUrl) => {
            user
              .findByIdAndUpdate(User._id, {
                $set: {
                  logo: subuserImgUrl,
                },
              })
              .then((response) => {
                res.json(response);
              })
              .catch((error) => {
                res.send({
                  error: "user image is not add",
                });
              });
          })
          .catch((error) => {
            res.send({
              error: "image url is not create",
            });
          });
      } else {
        res.send({
          msg: "user create successfully",
          data: User,
        });
      }
    }
  });
};

exports.manage_Status = (req, res) => {
  user.findById(req.params.userId).exec((err, list) => {
    if (err) {
      res.send({
        error: "user list not find",
      });
    } else {
      if (list.status == "Deactivate") {
        user
          .findByIdAndUpdate(
            {
              _id: req.params.userId,
            },
            {
              $set: {
                status: "Active",
              },
            }
          )
          .exec((err, updateData) => {
            if (err) {
              res.send({
                error: "user status not update",
              });
            } else {
              var to = updateData.email;
              const userinfo = {
                sendgrid_key: process.env.email,
                to: to,
                from_email: "tekeshwar810@gmail.com",
                from_name: "noreply@gmail.com",
              };
              userinfo.subject = "email information";
              userinfo.content = `<p>email:${updateData.email}</p>
                                            <p>password:${updateData.password}</p>`;
              sgMail
                .send_via_sendgrid(userinfo)
                .then((resp) => {
                  res.send({
                    msg: "your acount is activate please check your email",
                  });
                })
                .catch((err) => {
                  res.send({
                    error: "email is not send",
                  });
                });
            }
          });
      } else if (list.status == "Active") {
        user
          .findByIdAndUpdate(
            {
              _id: req.params.userId,
            },
            {
              $set: {
                status: "Deactivate",
              },
            }
          )
          .exec((err, updateData) => {
            if (err) {
              res.send({
                error: "user status not update",
              });
            } else {
              res.send({
                msg: "user status is deactivate",
              });
            }
          });
      }
    }
  });
};
exports.update_user = (req, res) => {
  user
    .updateOne(
      {
        _id: req.params.userId,
      },
      req.body
    )
    .exec((err, updateUser) => {
      if (err) {
        res.send(err);
      } else {
        if (req.file) {
          cloudUrl
            .imageUrl(req.file)
            .then((subuserImgUrl) => {
              user
                .findByIdAndUpdate(req.params.userId, {
                  $set: {
                    logo: subuserImgUrl,
                  },
                })
                .then((response) => {
                  res.json(response);
                })
                .catch((error) => {
                  res.send({
                    error: "user image is not update",
                  });
                });
            })
            .catch((error) => {
              res.send({
                error: "image url is not create",
              });
            });
        } else {
          res.send(updateUser);
        }
      }
    });
};
//todo Pavan - create a update api for admin that will give a limited scope to admin to modify schools/user data.
exports.update_user_by_admin = async (req, res) => {
  let data = req.body;
  let query = req.params;
  let filter = {
    role: 0,
    _id: query.userId,
  };
  let update = {
    status: data.status,
    location: data.location,
  };

  let updatedUser = await user
    .findOneAndUpdate(filter, update, {
      returnOriginal: false,
    })
    .exec();
  if (!updatedUser) {
    res.send({
      staus: false,
      msg: "unable to update user",
    });
  }
  res.send({
    status: true,
    msg: "User has been updated successfully",
    data: {
      status: updatedUser["status"],
      location: updatedUser["location"],
    },
  });
};

// only for demo
exports.update_user_stripe_info = async (req, res) => {
  let data = req.body;
  const userId = req.params.userId;
  try {
    const stripe_sec = req.body.stripe_sec;
    const stripe_pub = req.body.stripe_pub;
    data.stripe_sec = stripe_sec;
    data.stripe_pub = stripe_pub;

    let update_user = await user.updateOne({
      _id: userId
    }, data)

    if (update_user.nModified < 1) {
      return res.send({
        msg: 'user not updated!',
        success: false
      })
    }

    return res.send({
      msg: "successfully updated!",
      success: true
    })
  } catch (err) {
    return res.send({ msg: err.message.replace(/\"/g, ''), success: false });
  }
}

exports.get_user_stripe_info = async (req, res) => {
  try{
    if(!req.params.userId){
      return res.send({
        msg:"no params found",
        success:false
      })
    }
    user.findById({ _id: req.params.userId }, { stripe_pub: 1, stripe_sec: 1,stripe_name:1 })
    .exec((err, data) => {
      if (err) {
        return res.send({
          msg: err.message.replace(/\"/g, ''),
          success:false        
        })
      }
      res.send({
        msg:"data",
        data:data,
        success:true
      })

    })
  }catch(err){
    return res.send({ msg: err.message.replace(/\"/g, ''), success: false });

  }
 

}

exports.remove = (req, res) => {
  user.findByIdAndRemove(req.params.userId).exec((err, removeData) => {
    if (err) {
      res.send({
        error: "user is not remove",
      });
    } else {
      res.send({
        msg: "user remove successfully",
      });
    }
  });
};

exports.removeAll = (req, res) => {
  let userIds = req.body.userId;
  user.remove({ _id: { $in: userIds } }).exec((err, removeData) => {
    if (err) {
      res.send({
        error: "user is not remove",
      });
    } else {
      res.send({
        msg: "user remove successfully",
        success: true
      });
    }
  });
};
