const membershipModal = require("../models/membership");
const moment = require("moment");
const buyMembership = require("../models/buy_membership");
const AddMember = require("../models/addmember");
var addmemberModal = require("../models/addmember");
const { errorHandler } = require("../helpers/dbErrorHandler");
const _ = require("lodash");
const Joi = require("@hapi/joi");
var mongo = require("mongoose");
const { valorTechPaymentGateWay } = require("./valorTechPaymentGateWay");

const createEMIRecord = require("../Services/createEMi");
// const ScheduleDateArray = require("../Services/scheduleDateArray");

const randomNumber = (length, addNumber) => {
  return parseInt(
    (Math.floor(Math.random() * length) + addNumber).toString().substring(1)
  );
};
exports.addSubscription = async (req, res) => {
  const payload = req.body;
  const resp = await valorTechPaymentGateWay.addSubscription()
  res.send(resp)
}
exports.membership_Info = (req, res) => {
  const id = req.params.membershipId;
  buy_membership
    .findById(id)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.update = async (req, res) => {
  const membershipId = req.params.membershipId;
  const type = req.params.type;
  try {
    if (req.body.isTerminate) {
      res.status(200).send({
        message: "Membership is terminated!",
        success: true,
      });
    } else {
      if (type == "others") {
        await buyMembership.updateOne({ _id: membershipId }, req.body);
        res.status(200).send({
          message: "Membership updated successfully!",
          success: true,
        });
      } else if (type == "freeze") {
        await buyMembership.findByIdAndUpdate(membershipId, {
          $set: { isFreeze: true, membership_status: "freeze" },
          $push: {
            whenFreeze: { date: new Date(), reason: req.body.reason },
          },
        });
        res.status(200).send({
          message: "Membership freezed successfully",
          success: true,
        });
      } else if (type == "unfreeze") {
        await buyMembership.findByIdAndUpdate(membershipId, {
          $set: { isFreeze: false, membership_status: "Active" },
          $push: {
            whenFreeze: { date: new Date(), reason: req.body.reason },
          },
        });
        res.status(200).send({
          message: "Membership unfreezed successfully",
          success: true,
        });
      } else if (type == "forfeit") {
        await buyMembership.findByIdAndUpdate(
          membershipId,
          {
            $set: { isForfeit: true },
            $push: {
              whenForFeit: { date: new Date(), reason: req.body.reason },
            },
          },
          (er, data) => {
            if (er) {
              res.send({
                message: "Membership forfeit failed!",
                success: false,
              });
            } else {
              res.status(200).send({
                message: "Membership forfeit successfully!",
                success: true,
              });
            }
          }
        );
      } else if (type == "terminate") {
        await buyMembership.findByIdAndUpdate(
          membershipId,
          {
            $set: { isTerminate: true, membership_status: "Terminated" },
            $push: {
              whenTerminate: {
                date: new Date(),
                reason: req.body.reason,
              },
            },
          },
          (err, data) => {
            if (err) {
              res.send({
                message: "Membership terminate failed!",
                success: false,
              });
            } else {
              res.status(200).send({
                message: "Membership terminated successfully",
                success: true,
              });
            }
          }
        );
      } else if (type == "refund") {
        await buyMembership.findByIdAndUpdate(
          membershipId,
          {
            $set: { isRefund: true, membership_status: "Deactivated" },
            $push: {
              refund: {
                Amount: req.body.total_amount,
                date: new Date(),
                reason: req.body.reason,
              },
            },
          },
          (err, data) => {
            if (err) {
              res.send({
                message: "Membership refund failed!",
                success: false,
              });
            } else {
              res.status(200).send({
                message: "Membership refunded successfully!",
                success: true,
              });
            }
          }
        );
      }
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.updatePayments = async (req, res) => {
  try {
    const buy_membershipId = req.params.membershipId;
    const emiId = req.params.emiID;
    const createdBy = req.body.createdBy;
    const balance = req.body.balance - req.body.Amount;

    await buyMembership.updateOne(
      {
        _id: buy_membershipId,
        "schedulePayments.Id": emiId,
      },
      {
        $set: {
          balance: balance,
          "schedulePayments.$.status": "paid",
          "schedulePayments.$.createdBy": createdBy,
          "schedulePayments.$.paidDate": new Date(),
        },
      },
      (err, data) => {
        if (err) {
          res.send({ error: err.message.replace(/\"/g, ""), success: false });
        } else {
          res.send({
            message: "Payment Successfully Updated!",
            success: true,
            error: false,
          });
        }
      }
    );
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.remove = (req, res) => {
  const id = req.params.membershipId;
  buyMembership
    .deleteOne({ _id: id })
    .then((resp) => {
      addmemberModal.update(
        { membership_details: id },
        { $pull: { membership_details: id } },
        function (err, data) {
          if (err) {
            res.send({ error: "mebership is not delete in student" });
          } else {
            res.send({ msg: "mebership is delete in student" });
          }
        }
      );
    })
    .catch((err) => {
      res.send(err);
    });
};

// exports.create = async (req, res) => {
//   try {
//     var studentId = req.params.studentId;
//     var Id = { userId: req.params.userId };
//     const duration = parseInt(req.body.payment_time);
//     const startPayment = req.body.start_payment_Date;
//     const Amount = req.body.payment_money;
//     const paymentMode = req.body.payment_type;
//     let buyMembershipSchema = Joi.object({
//       membership_name: Joi.string().required(),
//       mactive_date: Joi.string().required(),
//       membership_duration: Joi.string().required(),
//       expiry_date: Joi.string().required(),
//       register_fees: Joi.number().required(),
//       totalp: Joi.number().required(),
//       start_payment_Date: Joi.string().required(),
//       dpayment: Joi.number().required(),
//       ptype: Joi.string().required(),
//       balance: Joi.number().required(),
//       payment_time: Joi.number().required(),
//       payment_type: Joi.string().required(),
//       payment_money: Joi.number().required(),
//       due_every: Joi.string().required(),
//       due_every_month: Joi.string().required(),
//       pay_inout: Joi.string().required(),
//       pay_latter: Joi.string().required(),
//       userId: Joi.string().required(),
//     });

//     await buyMembershipSchema.validateAsync(req.body);

//     if (
//       req.body.ptype == "cash" ||
//       req.body.ptype == "check" ||x
//       req.body.ptype == "card"
//     ) {
//       if (req.body.balance == 0) {
//         status = { membership_status: "Active" };
//         membershipDetails = _.extend(req.body, status);
//         var membership = new buyMembership(membershipDetails);
//         memberbuy = _.extend(membership, Id);

//         memberbuy.save((err, data) => {
//           if (err) {
//             res.send({ error: "membership not buy" });
//           } else {
//             query = { _id: studentId };
//             console.log(query);
//             update = {
//               $set: { status: "active" },
//               $push: { membership_details: data._id },
//             };

//             addmemberModal.findOneAndUpdate(query, update, (err, stdData) => {
//               if (err) {
//                 res.send({ error: "membership id is not add in student" });
//               } else {
//                 buyMembership
//                   .findOneAndUpdate(
//                     { _id: data._id },
//                     { $push: { studentInfo: stdData._id } }
//                   )
//                   .exec(async (err, result) => {
//                     if (err) {
//                       res.send({
//                         error: "student id is not add in buy membership",
//                       });
//                     } else {
//                       res.send({
//                         msg: "membership purchase successfully",
//                         data: result,
//                       });
//                     }
//                   });
//               }
//             });
//           }
//         });
//       } else {
//         paymentArr = new Array(duration).fill().map((e, i) => {
//           i++;
//           return _.invert({ false: `${i}_installment` });
//         });
//         ar = ScheduleDateArray(
//           startPayment,
//           duration,
//           Amount,
//           paymentArr,
//           paymentMode
//         );
//         membershipDetails = _.extend(req.body, { membership_status: "Active" });
//         // membershipDetails = _.extend(req.body, { paymentArr: paymentArr })
//         membershipDetails = _.extend(req.body, { schedulePayments: ar });
//         var membership = new buyMembership(membershipDetails);
//         memberbuy = _.extend(membership, Id);
//         memberbuy.save((err, data) => {
//           if (err) {
//             res.send({ error: "membership not buy" });
//           } else {
//             query = { _id: studentId };
//             update = {
//               $set: { status: "active" },
//               $push: { membership_details: data._id },
//             };
//             addmemberModal.findOneAndUpdate(query, update, (err, stdData) => {
//               if (err) {
//                 res.send({ error: "membership id is not add in student" });
//               } else {
//                 buyMembership
//                   .findOneAndUpdate(
//                     { _id: data._id },
//                     { $push: { studentInfo: stdData._id } }
//                   )
//                   .exec(async (err, result) => {
//                     if (err) {
//                       res.send({
//                         error: "student id is not add in buy membership",
//                       });
//                     } else {
//                       res.send({
//                         msg: "membership purchase successfully",
//                         data: result,
//                       });
//                     }
//                   });
//               }
//             });
//           }
//         });
//       }
//     }
//     // else {
//     //     //     // a = ar.filter(i => moment(i.date).month() == moment().month())
//     //     //     // status = { membership_status: a[0].status }
//     //     //     // membershipDetails = _.extend(req.body, status)
//     //     // }

//     // }
//   } catch (error) {
//     res.send({ error: error.message.replace(/\"/g, ""), success: false });
//   }
// };

exports.buyMembership = async (req, res) => {
  const userId = req.params.userId;
  const studentId = req.params.studentId;
  const membershipData = req.body;
  membershipData.userId = userId;
  try {
    // const memberships = await buyMembership.find({
    //   studentInfo: { $in: [studentId] },
    //   membershipIds: { $in: [membershipData.membershipId] },
    //   membership_status:"Active"
    // });
    // if (memberships.length) {
    //   console.log(memberships)

    //   res.send({message:"this membership already bought!",success:false});
    // } else {
    if (membershipData.isEMI) {
      if (membershipData.payment_time > 0 && membershipData.balance > 0) {
        membershipData.schedulePayments = createEMIRecord(
          membershipData.payment_time,
          membershipData.payment_money,
          membershipData.mactive_date,
          membershipData.createdBy,
          membershipData.payment_type
        );
        membershipData.membership_status = "Active";
        let membership = new buyMembership(membershipData);
        membership.save((err, data) => {
          if (err) {
            res.send({ error: "membership not buy" });
          } else {
            update = {
              $set: { status: "active" },
              $push: { membership_details: data._id },
            };
            addmemberModal.findOneAndUpdate(
              { _id: studentId },
              update,
              (err, stdData) => {
                if (err) {
                  res.send({ error: "membership id is not add in student" });
                } else {
                  buyMembership
                    .findOneAndUpdate(
                      { _id: data._id },
                      {
                        $push: {
                          studentInfo: stdData._id,
                          membershipIds: membershipData.membershipId,
                        },
                      }
                    )
                    .exec(async (err, result) => {
                      if (err) {
                        res.send({
                          error: "student id is not add in buy membership",
                        });
                      } else {
                        res.send({
                          msg: "membership purchase successfully",
                          data: result,
                        });
                      }
                    });
                }
              }
            );
          }
        });
      } else {
        res.send({ message: "payment_time must required", success: false });
      }
    } else {
      if (!membershipData.isEMI && membershipData.balance == 0) {
        membershipData.due_status = "paid";
        membershipData.membership_status = "Active";
        let membership = new buyMembership(membershipData);
        membership.save((err, data) => {
          if (err) {
            res.send({ error: "membership not buy" });
          } else {
            update = {
              $set: { status: "active" },
              $push: { membership_details: data._id },
            };
            addmemberModal.findOneAndUpdate(
              { _id: studentId },
              update,
              (err, stdData) => {
                if (err) {
                  res.send({ error: "membership id is not add in student" });
                } else {
                  buyMembership
                    .findOneAndUpdate(
                      { _id: data._id },
                      {
                        $push: {
                          studentInfo: stdData._id,
                          membershipIds: membershipData.membershipId,
                        },
                      }
                    )
                    .exec(async (err, result) => {
                      if (err) {
                        res.send({
                          error: "student id is not add in buy membership",
                        });
                      } else {
                        res.send({
                          msg: "membership purchase successfully",
                          data: result,
                        });
                      }
                    });
                }
              }
            );
          }
        });
      } else {
        res.send({ message: "balance should be zero", success: false });
      }
    }
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ""), success: false });
  }
};
// async function cronForEmiStatus() {
//   current_Date = moment().format("YYYY-MM-DD");
//   const EmiData = await buyMembership.find({ isEMI: true });
//   EmiData.forEach((element) => {
//     let EmiArr = element.emi_record;
//     EmiArr.forEach(async (i) => {
//       if (moment(current_Date).isAfter(i.date)) {
//         await buyMembership.updateOne(
//           { _id: element._id, "emi_record.date": i.date },
//           { $set: { "emi_record.$.Status": "overdue" } }
//         );`
//       }
//     });
//   });
// }
// cronForEmiStatus();

exports.membership_InfoById = async (req, res) => {
  var membershipID = req.params.membershipID;
  var userId = req.params.userId;
  try {
    membershipData = await buyMembership.find({
      _id: membershipID,
      userId: userId,
    });
    res.send({
      msg: "done",
      data: membershipData,
    });
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ""), success: false });
  }
};

exports.members_info = async (req, res) => {
  var studentId = req.params.studentId;
  let studentInfo = await AddMember.findById(studentId);
  currentDate = moment().format("YYYY-MM-DD");
  try {
    let { membership_details } = studentInfo;
    let membershipDa = await buyMembership.find({
      _id: { $in: membership_details, membershipIds },
    });
    // membershipDa.filter(i => {
    //     if (moment(currentDate).isSameOrAfter(i.expiry_date)) {
    //         console.log(i)
    //         i.membership_status = 'Expired'
    //     }
    // })
    res.send({
      msg: "done",
      data: membershipDa,
    });
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ""), success: false });
  }
};

exports.lastestMembership = async (req, res) => {
  var totalCount = await addmemberModal
    .find({
      userId: req.params.userId,
    })
    .countDocuments();

  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  buyMembership
    .find(
      {
        userId: req.params.userId,
      },
      {
        membership_name: 1,
        totalp: 1,
        mactive_date: 1,
        payment_type: 1,
        membership_status: 1,
      }
    )
    .populate({
      path: "studentInfo",
      select: "firstName lastName school program studentType",
    })
    .sort({
      createdAt: -1,
    })
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, memberdata) => {
      if (err) {
        res.send({
          error: "member data is not find",
        });
      } else {
        res.send({ memberdata, totalCount: totalCount, success: true });
      }
    });
};

exports.thismonthMembership = async (req, res) => {
  var totalCount = await addmemberModal
    .find({
      userId: req.params.userId,
    })
    .countDocuments();

  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  buyMembership
    .find(
      {
        userId: req.params.userId,
      },
      {
        membership_name: 1,
        totalp: 1,
        mactive_date: 1,
        payment_type: 1,
        membership_status: 1,
      }
    )
    .populate({
      path: "studentInfo",
      select: "firstName lastName school program studentType",
    })
    .sort({
      createdAt: -1,
    })
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, memberdata) => {
      if (err) {
        res.send({
          error: "member data is not find",
        });
      } else {
        res.send({ memberdata, totalCount: totalCount, success: true });
      }
    });
};

exports.expiredMembership = async (req, res) => {
  var totalCount = await addmemberModal
    .find({
      userId: req.params.userId,
    })
    .countDocuments();

  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  addmemberModal
    .aggregate([
      { $match: { userId: req.params.userId } },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          expiry_date: { $toDate: "$expiry_date" },
          studentInfo: 1,
          createdAt: 1,
        },
      },
      // {
      //   $lookup: {
      //     from: "members",
      //     localField: "studentInfo",
      //     foreignField: "_id",
      //     as: "data",
      //   },
      // },
      {
        $group: {
          _id: "$studentInfo",
          createdAt: { $last: "$createdAt" },
          membership_name: { $first: "$membership_name" },
          expiry_date: { $first: "$expiry_date" },
          membership_name: { $first: "$membership_name" },

          // studentInfo: { $last: "$studentInfo" },
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "_id",
          foreignField: "_id",
          as: "data",
        },
      },
      // {
      //   $replaceRoot: {
      //     newRoot: {
      //       $mergeObjects: [{ $arrayElemAt: ["$data", 0] }, "$$ROOT"],
      //     },
      //   },
      // },
      {
        $project: {
          data: 1,
          expiry_date: 1,
          membership_name: 1,
          createdAt: 1,
          studentInfo: 1,
        },
      },
      {
        $match: { expiry_date: { $gte: new Date() } },
      },
      {
        $sort: { expiry_date: 1 },
      },
    ])
    // .find(
    //   {
    //     userId: req.params.userId,
    //   },
    //   {
    //     membership_name: 1,
    //     membership_status: 1,
    //     expiry_date: 1,
    //     createdAt:1
    //   }
    // )
    // .populate({
    //   path: "studentInfo",
    //   select: "firstName lastName school program studentType primaryPhone",
    //   // options: { sort: [['created', 'dsc']]
    // })
    // .sort({
    //   createdAt: -1,
    // })
    // .limit(pagination.limit)
    // .skip(pagination.skip)
    .exec((err, memberdata) => {
      if (err) {
        res.send({
          error: err,
        });
      } else {
        res.send({ memberdata, totalCount: totalCount, success: true });
      }
    });
};
