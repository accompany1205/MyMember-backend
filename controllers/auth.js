require('dotenv').config()
const User = require("../models/user");
const _ = require("lodash");
const jwt = require("jsonwebtoken"); // to generate signed token
const expressJwt = require("express-jwt"); // for authorization check
const {
  errorHandler
} = require("../helpers/dbErrorHandler");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const from_email = process.env.from_email;
const navbar = require("../models/navbar.js");
const {
  map
} = require('lodash');
const { errorMonitor } = require('events');


// TODO - Rakesh - Please write a mail service if user is coming with role 0(School)
//TODO - Rakesh - Please read the admin email ids using a mongo query with the role 1.
//todo - Pavan - #Copleted!


//Signup stsrting.....
exports.signup = async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const user = new User(req.body);
  const admins = await User.find({
    "role": 1
  }, {
    email: 1,
    _id: 0
  });
  let sendToAllAdmins = [];
  if (!admins.length) {
    res.send({
      "msg": "There is any admin avaible to accept your request."
    })
  }
  admins.map(email => {
    sendToAllAdmins.push(email["email"])
  })
  console.log("Here we can send the emails", sendToAllAdmins)
  console.log(admins);

  //todo Pavan - Need to restructure the mail body as per the requirement
  let msg = {
    to: sendToAllAdmins, // Change to your recipient
    from: from_email, // Change to your verified sender
    subject: 'Varification Email For User',
    text: 'Please find the below URL to activate your resent registered user - ',
    html: `<h2>Please click on given link to accept the user's request</h2>
                          <p>${process.env.RESET_URL}</p>
                          `,
  }
  user.save((err, user) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        // error: errorHandler(err)
        error: "Email is taken",
      });
    }

    user.salt = undefined;
    user.hashed_password = undefined;
    navbar_custom(user.id);
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
    res.json({
      user
    });
  });
};
//...signup ending.

exports.approveUserRequestByAdmin = async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  let data = req.body;
  let query = req.params;
  let filter = {
    "role": 0,
    "_id": query.userId
  };
  let update = {
    "status": data.status,
    "isverify": data.isverify
  }

  let updatedUser = await User.findOneAndUpdate(filter, update, {
    returnOriginal: false
  }).exec();
  if (!updatedUser) {
    res.send({
      "staus": false,
      "msg": "unable to update user"
    })
  }
  let msg = {
    to: updatedUser.email, // Change to your recipient
    from: from_email, // Change to your verified sender
    subject: 'Registration process with My_Member',
    text: 'Congratulation, your request has been accepted.',
    html: `<h2>congratulation, your registration with My Member is completed.</h2>
                          <p>You can login here - ${process.env.RESET_URL}</p>
                          `,
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
  res.send({
    "status": true,
    "msg": "User has been updated successfully",
    "data": {
      "status": updatedUser["status"],
      "location": updatedUser["isverify"]
    }
  })
}

exports.forgetpasaword = (req, res) => {
  var {
    email
  } = req.body;
  User.findOne({
    email
  }, (err, user) => {
    if (err || !user) {
      res.send({
        error: "user with email does not exist"
      });
    } else {
      var resetPassToken = jwt.sign({
        _id: user._id
      },
        process.env.JWT_RESET_PASSWORD_KEY
      );
      var Email = user.email;
      const resetPassData = {
        to: Email,
        from: from_email,
        subject: "reset password link",
        html: `<h2>Please click on given link to reset your password</h2>
                            <p>${process.env.RESET_URL}/reset_password/${resetPassToken}</p>
                            `,
      };
      User.updateOne({
        _id: user._id
      }, {
        reset_token: resetPassToken
      },
        (err, success) => {
          if (err) {
            res.send({
              error: "reset token is not add"
            });
          } else {
            sgMail.send(resetPassData, function (err, data) {
              if (err) {
                res.send({
                  error: "email not sent"
                });
                console.log(err);
              } else {
                res.send({
                  msg: "email send successfully reset link sent your email",
                });
              }
            });
          }
        }
      );
    }
  });
};

exports.resetPassword = (req, res) => {
  var newPass = req.body.newPass;
  var Token = req.headers["authorization"];
  const bearer = Token.split(" ");
  const bearerToken = bearer[1];
  if (typeof bearerToken !== "undefined") {
    jwt.verify(
      bearerToken,
      process.env.JWT_RESET_PASSWORD_KEY,
      (err, decodeToken) => {
        if (err) {
          res.send({
            error: "incorrect token or it expire"
          });
        } else {
          console.log(decodeToken);
          User.findByIdAndUpdate({
            _id: decodeToken._id
          }, {
            $set: {
              reset_token: "",
              hashed_password: newPass
            }
          }).exec((err, restdata) => {
            if (err) {
              res.send({
                error: "password is not reset"
              });
            } else {
              res.send({
                error: "password is reset successfully"
              });
            }
          });
        }
      }
    );
  } else {
    res.send({
      error: "authentication error"
    });
  }
};

// exports.signup = (req, res) => {
//     // console.log("req.body", req.body);
//     // const info = req.body;
//     const email = req.body.email;
//     const token = jwt.sign(req.body, process.env.JWT_ACC_ACTIVATE, { expiresIn: '60m' })

//     User.findOne({email}).exec((err,userEmail)=>{
//         if(userEmail){
//             res.send({error:'email is already exist'})
//         }else{
//             const emailData = {
//                 to: email,
//                 from: 'tekeshwar810@gmail.com',
//                 subject: 'user verification link',
//                 html:`<p>${process.env.CLIENT_URL}/email_activation/${token}</p>`
//             };
//             sgMail.send(emailData, function (err, data) {
//                 if (err) {
//                     res.send({ error: 'email not sent' })
//                     console.log(err)
//                 }
//                 else {
//                     res.send({ msg: 'email send successfully please verify your email',data:data })
//                 }
//             })
//         }

//     })

// };

// exports.activation = (req, res) => {
//     var Token = req.headers["authorization"]
//     const bearer = Token.split(' ');
//     const bearerToken = bearer[1];

//     if (typeof bearerToken !== 'undefined'){
//         jwt.verify(bearerToken, process.env.JWT_ACC_ACTIVATE, (err, decodedToken) => {
//             if (err) {
//                 res.send({ error: 'expire or invaild token' })
//             }
//             else {
//                 console.log(decodedToken)
//                 const detailsUser = decodedToken.info;
//                 const user = new User(detailsUser);
//                 const obj= {
//                     isverify:true
//                 }
//                 const newUser = _.extend(user,obj)
//                 console.log(newUser)
//                         console.log(user)
//                         user.save((err, user) => {
//                             if (err) {
//                                 console.log(err)
//                                 return res.status(400).json({
//                                     // error: errorHandler(err)
//                                     error: 'user is not signup'
//                                 });
//                             }
//                             user.salt = undefined;
//                             user.hashed_password = undefined;
//                             res.json({
//                                 user
//                             });
//                         });
//                     }
//                 })

//             }
//     else {
//         res.send({ error: 'somthing went wrong' })
//     }
// }

// using async/await
// exports.signup = async (req, res) => {
//     try {
//         const user = await new User(req.body);
//         console.log(req.body);

//         await user.save((err, user) => {
//             if (err) {
//                 // return res.status(400).json({ err });
//                 return res.status(400).json({
//                     error: 'Email is taken'
//                 });
//             }
//             res.status(200).json({ user });
//         });
//     } catch (err) {
//         console.error(err.message);
//     }
// };

exports.signin = (req, res) => {
  // find the user based on email
  const {
    username,
    password
  } = req.body;
  console.log(req.body);
  User.findOne({
    username
  }).exec((err, data) => {
    if (err || !data) {
      console.log(err);
      return res.status(400).json({
        error: "User with that email does not exist. Please signup",
      });
    } else {
      console.log('data', data)
      if (data.password == req.body.password) {
        if (data.role == 0) {
          if (data.status == "Active") {
            // if (!data.authenticate(password)) {
            //     return res.status(401).json({
            //         error: 'Email and password dont match'
            //     });
            // }
            token = jwt.sign({
              id: data._id
            }, process.env.JWT_SECRET);
            res.cookie("t", token, {
              expire: new Date() + 9999
            });
            const {
              _id,
              username,
              name,
              email,
              role,
              logo,
              location_name,
            } = data;
            console.log(data);
            return res.json({
              token,
              data: {
                _id,
                username,
                email,
                name,
                role,
                logo,
                location_name
              },
            });
          } else {
            return res.json({
              error: "your account is deactivate"
            });
          }
        } else if (data.role == 1) {
          // if (!data.authenticate(password)) {
          //     return res.status(401).json({
          //         error: 'Email and password dont match'
          //     });
          // }
          token = jwt.sign({
            id: data._id,
            role: data.role
          },
            process.env.JWT_SECRET
          );
          res.cookie("t", token, {
            expire: new Date() + 9999
          });
          const {
            _id,
            username,
            name,
            email,
            role
          } = data;
          return res.json({
            token,
            data: {
              _id,
              username,
              email,
              name,
              role
            },
          });
        }
      } else {
        res.send({
          error: "password is wrong"
        });
      }
    }
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({
    message: "Signout success"
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  console.log("data", req.auth);
  // console.log('data',req.profile)
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access denied",
    });
  }
  next();
};

if (!process.env.JWT_SECRET) {
  var jwtKey = require("./jwtKey.js").jwtKey;
} else {
  var jwtKey = process.env.JWT_SECRET;
}

exports.verifySchool = (req, res, next) => {
  var Token = req.headers["authorization"];
  const bearer = Token.split(" ");
  const bearerToken = bearer[1];

  if (typeof bearerToken !== "undefined") {
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
      console.log(authData, req.params.userId);
      if (err) {
        res.sendStatus(403);
      } else {
        if (authData.id == req.params.userId) {
          next();
        } else {
          res.sendStatus(403);
        }
      }
    });
  } else {
    res.sendStatus(403);
  }
};

exports.isSchoolActiveted = (req, res, next) => {

  var token = req.headers["authorization"];
  const bearer = token.split(" ")
}


exports.isAdmin = (req, res, next) => {
  var Token = req.headers["authorization"];
  const bearer = Token.split(" ");
  const bearerToken = bearer[1];
  if (typeof bearerToken !== "undefined") {
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, adminData) => {
      console.log(adminData, req.params.userId, "run");
      if (err) {
        res.sendStatus(403);
      } else {
        if (adminData.id == req.params.adminId && adminData.role == 1) {
          console.log(adminData);
          next();
        } else {
          res.sendStatus(403);
        }
      }
    });
  } else {
    res.sendStatus(403);
  }
};

function navbar_custom(user_id) {
  const Data = [{
    user_id: user_id,
    ui: "Dashboard",
    li: "",
  },
  {
    user_id: user_id,
    ui: "Student",
    li: [
      "Student",
      "Active Trail",
      "Lead",
      "Former Student",
      "Former Trail",
      "After School",
      "Camp",
      "Studen By Program",
      "Membership by Program",
    ],
  },

  {
    user_id: user_id,
    ui: "My School",
    li: ["Miss you call", "Renewals", "Birthday", "Candidates"],
  },
  {
    user_id: user_id,
    ui: "Testing",
    li: ["Eligible", "Recomended", "Registration"],
  },
  {
    user_id: user_id,
    ui: "Task and Goal",
    li: ["To Do List", "Goal"],
  },
  {
    user_id: user_id,
    ui: "Calendar",
    li: ["Attendence", "Appointment", "Self Check In"],
  },
  {
    user_id: user_id,
    ui: "Marketing",
    li: ["Email", "Compose", "Nurturing", "System", "Library", "Sent"],
  },
  {
    user_id: user_id,
    ui: "Shop",
    li: ["Membership", "Store", "Testing", "Purchase History"],
  },
  {
    user_id: user_id,
    ui: "My Money",
    li: ["Expenses", "Finance"],
  },
  {
    user_id: user_id,
    ui: "Finance",
    li: ["Delinquent", "Forecast", "CC Expiring", "Test"],
  },
  {
    user_id: user_id,
    ui: "Statistics",
    li: [
      "Active Students",
      "Active Trial",
      "Lead",
      "Former Student",
      "Former Trial",
      "After School",
      "Camp",
    ],
  },
  {
    user_id: user_id,
    ui: "Documents",
    li: "",
  },
  {
    user_id: user_id,
    ui: "Settings",
    li: "",
  },
  ];

  navbar.insertMany(Data).then((response) => {
    console.log(response);
  });
}

exports.get_navbar = async (req, res) => {
  const {
    user_id
  } = req.body;
  await navbar
    .find({
      user_id: user_id
    }, {
      _id: 0,
      user_id: 0,
      __v: 0
    })
    .then((response) => {
      res.send(response);

    })
    .catch((error) => {
      res.json({
        error: errorHandler(error)
      });
    });
};

exports.edit_navbar_li = async (req, res) => {
  const {
    user_id,
    ui,
    li,
    newli
  } = req.body;
  await navbar
    .updateOne({
      user_id: user_id,
      ui: ui,
      li: li
    }, {
      $set: {
        "li.$": newli
      }
    })
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.json({
        error: errorHandler(error)
      });
    });
};
exports.edit_navbar_ui = async (req, res) => {
  const {
    user_id,
    ui,
    newui
  } = req.body;
  await navbar
    .updateOne({
      user_id: user_id,
      ui: ui
    }, {
      $set: {
        ui: newui
      }
    })
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.json({
        error: errorHandler(error)
      });
    });
};

///////////////////////////////////////
exports.updateUser = async (req, res) => {

  await User.findByIdAndUpdate(req.params.userId, req.body)
    .exec((err, data) => {
      if (err) {
        console.log(err); 
        res.send({ error: "User is not updated!" ,status:"failure"})
      }
      else {
        console.log(data);
        res.status(200).send({ msg: 'User is updated successfully',status:"success" })
      }
    })
}



      
