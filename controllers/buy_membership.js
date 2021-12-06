const membershipModal = require("../models/membership");
const moment = require("moment");
const buyMembership = require("../models/buy_membership");
const Finance_infoSchema = require("../models/finance_info");
const AddMember = require("../models/addmember");
const _ = require("lodash");
const Joi = require("@hapi/joi");
var mongo = require("mongoose");
const { valorTechPaymentGateWay } = require("./valorTechPaymentGateWay");

const createEMIRecord = require("../Services/createEMi");

const randomNumber = (length, addNumber) => {
  return parseInt(
    (Math.floor(Math.random() * length) + addNumber).toString().substring(1)
  );
};

const getUidAndInvoiceNumber = () => {
  return {
    uid: randomNumber(100000000000, 100),
    invoice_no: randomNumber(10000000, 100),
  };
};

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
  const paymentType = req.params.paymentType;
  const valorPayload = req.body.valorPayload;
  try {
    if (req.body.isTerminate) {
      res.status(200).send({
        message: "Membership already terminated!",
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
        if (valorPayload) {
          const freezeValorPayload =
            await valorTechPaymentGateWay.freezeSubscription({
              ...valorPayload,
              freeze_start_date: req.body.freeze_start_date,
              freeze_stop_date: req.body.freeze_stop_date,
            });
          if (freezeValorPayload?.data?.error_no === "S00") {
            const freezeRes = await freezeMembership(membershipId, req.body);
            if (freezeRes) {
              res.status(200).send({
                message: "Membership freezed successfully",
                success: true,
              });
            } else {
              res.status(400).send({
                msg: "Membership not updated but valor freezed for membership!",
                success: false,
              });
            }
          } else {
            res.status(400).send({
              message:
                "Due to the technical issue subscription not freeze please try again or later!",
              success: false,
            });
          }
        } else {
          const freezeRes = await freezeMembership(membershipId, req.body);
          if (freezeRes) {
            res.status(200).send({
              message: "Membership freezed successfully",
              success: true,
            });
          } else {
            res.status(400).send({
              msg: "Membership not freezed please try again!",
              success: false,
            });
          }
        }
      } else if (type == "unfreeze") {
        let unfreezeRes;
        if (valorPayload) {
          const valorRes = await valorTechPaymentGateWay.unfreezeSubscription(
            valorPayload
          );
          if (valorRes.data.error_no === "S00") {
            unfreezeRes = await unFreezeMembership(membershipId, req.body);
            if (unfreezeRes) {
              res.status(200).send({
                msg: "Membership unfreezed successfully",
                success: true,
              });
            } else {
              res.status(400).send({
                msg: "Membership not unfreeze in DB but valorPayTech unfreezed membership!",
                success: false,
              });
            }
          } else {
            res.status(400).send({
              msg: "Due to internal issue membership not unfreezed please try again!!",
              success: false,
            });
          }
        } else {
          unfreezeRes = await unFreezeMembership(membershipId, req.body);
          if (unfreezeRes) {
            res.status(200).send({
              msg: "Membership unfreezed successfully",
              success: true,
            });
          } else {
            res.status(400).send({
              msg: "Membership not unfreeze please try again!",
              success: false,
            });
          }
        }
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
        let refundRes;
        if (valorPayload) {
          const valorRefundRes =
            await valorTechPaymentGateWay.refundSubscription({
              ...valorPayload,
              amount: req.body.amount,
            });
          if (valorRefundRes.data.error_no === "S00") {
            refundRes = await refundMembership(membershipId, req.body);
            if (refundRes) {
              res.status(200).send({
                msg: "Membership refunded successfully!",
                success: true,
              });
            } else {
              res.status(400).send({
                msg: "Refunded successfully but stundet info not updated!",
                success: false,
              });
            }
          } else {
            res.status(400).send({
              msg: "Due to network issue membership not refunded please try again!!",
              success: true,
            });
          }
        } else {
          refundRes = await refundMembership(membershipId, req.body);
          if (refundRes) {
            res.status(200).send({
              msg: "Membership refunded successfully!",
              success: true,
            });
          } else {
            res.status(400).send({
              msg: "Refund failed please try again!",
              success: false,
            });
          }
        }
      }
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

async function freezeMembership(membershipId, payload) {
  return new Promise((resolve, reject) => {
    buyMembership
      .findByIdAndUpdate(membershipId, {
        $set: { isFreeze: true, membership_status: "freeze" },
        $push: {
          whenFreeze: {
            date: new Date(),
            reason: payload.reason,
            freeze_start_date: payload.freeze_start_date,
            freeze_stop_date: payload.freeze_stop_date,
          },
        },
      })
      .exec((err, data) => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
  });
}

function unFreezeMembership(membershipId, payload) {
  return new Promise((resolve, reject) => {
    buyMembership
      .findByIdAndUpdate(membershipId, {
        $set: { isFreeze: false, membership_status: "Active" },
        $push: {
          whenFreeze: { date: new Date(), reason: payload.reason },
        },
      })
      .exec((err, data) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
  });
}

function refundMembership(membershipId, payload) {
  return new Promise((resolve, reject) => {
    buyMembership.findByIdAndUpdate(
      membershipId,
      {
        $set: { isRefund: true, membership_status: "Deactivated" },
        $push: {
          refund: {
            Amount: payload.amount,
            date: new Date(),
            reason: payload.reason,
          },
        },
      },
      (err, data) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

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
      AddMember.update(
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

//             AddMember.findOneAndUpdate(query, update, (err, stdData) => {
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
//             AddMember.findOneAndUpdate(query, update, (err, stdData) => {
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
  let valorPayload = req.body.valorPayload;
  let membershipData = req.body.membership_details;
  const Address = valorPayload.address;
  let memberShipDoc;
  membershipData.userId = userId;
  try {
    if (membershipData.isEMI) {
      if (membershipData.payment_time > 0 && membershipData.balance > 0 && membershipData.payment_type != "pif") {
        membershipData.schedulePayments = createEMIRecord(
          membershipData.payment_time,
          membershipData.payment_money,
          membershipData.mactive_date,
          membershipData.createdBy,
          membershipData.payment_type
        );
        membershipData.membership_status = "Active";
        valorPayload.descriptor = "BETA TESTING";
        valorPayload.product_description = "Mymember brand Product";
        valorPayload.surchargeIndicator =  1;
        if (valorPayload) {
          valorPayload = { ...valorPayload, ...getUidAndInvoiceNumber() };
          const FormatedPayload = getFormatedPayload(valorPayload);
          const resp = await valorTechPaymentGateWay.addSubscription(
            FormatedPayload
          );
          console.log("PRALHJAD " ,resp)
          if (resp.data.error_code == 00) {
            valorPayload.subscription_id = resp.data.subscription_id;
            valorPayload.address = Address;
            valorPayload.userId = userId;
            valorPayload.studentId = studentId;
            const financeDoc = await createFinanceDoc(valorPayload);
            if (financeDoc.success) {
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              res.send(memberShipDoc);
            } else {
              res.send({
                msg: "Finance and membership doc not created!",
                success: false,
              });
            }
          } else {
            res.send({ msg: resp.data.desc, success: false });
          }
        } else {
          memberShipDoc = await createMemberShipDocument(
            membershipData,
            studentId
          );
          res.send(memberShipDoc);
        }
      } else {
        res.send({ msg: "payment type should be weekly/monthly", success: false });
      }
    } else {
      if (!membershipData.isEMI && membershipData.balance == 0 && membershipData.payment_type === "pif") {
        membershipData.due_status = "paid";
        membershipData.membership_status = "Active";
        if (valorPayload) {
          const { uid } = getUidAndInvoiceNumber();
          valorPayload = { ...valorPayload, uid };
          const FormatedPayload = getFormatedPayload(valorPayload);
          const resp = await valorTechPaymentGateWay.saleSubscription(
            FormatedPayload
          );
          if (resp.data.error_no === "S00") {
            valorPayload.transactionId = {
              rrn: resp.data.rrn,
              txnid: resp.data.txnid,
              token: resp.data.token,
            };
            valorPayload.address = Address;
            valorPayload.userId = userId;
            valorPayload.studentId = studentId;
            const financeDoc = await createFinanceDoc(valorPayload);
            if (financeDoc.success) {
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              res.send(memberShipDoc);
            } else {
              res.send({
                msg: "Finace and membership doc not created!",
                success: false,
              });
            }
          } else {
            res.send({ msg: resp.data.desc, success: false });
          }
        } else {
          memberShipDoc = await createMemberShipDocument(
            membershipData,
            studentId
          );
          res.send(memberShipDoc);
        }
      } else {
        res.send({ msg: "payment type should be  pif ", success: false });
      }
    }
  } catch (error) {
    res.send({ msg: error.message.replace(/\"/g, ""), success: false });
  }
};

function getFormatedPayload(valorPayload) {
  const payload = valorPayload;
  const address = payload.address;
  delete payload.address;
  return {
    ...payload,
    ...address,
  };
}

function createMemberShipDocument(membershipData, studentId) {
  return new Promise((resolve, reject) => {
    let membership = new buyMembership(membershipData);
    membership.save((err, data) => {
      if (err) {
        resolve({ msg: "membership not buy", success: false });
      } else {
        update = {
          $set: { status: "active" },
          $push: { membership_details: data._id },
        };
        AddMember.findOneAndUpdate(
          { _id: studentId },
          update,
          (err, stdData) => {
            if (err) {
              resolve({ msg: "membership id is not add in student", success: false });
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
                    resolve({
                      msg: "student id is not add in buy membership",
                      success: false
                    });
                  } else {
                    resolve({
                      msg: "membership purchase successfully",
                      data: result,
                      success: true
                    });
                  }
                });
            }
          }
        );
      }
    });
  });
}

function createFinanceDoc(data) {
  return new Promise((resolve, reject) => {
    const financeData = new Finance_infoSchema(data);
    financeData.save((err, data) => {
      if (err) {
        resolve({ success: false, msg: "Finance data is not stored!" });
      } else {
        resolve({ success: true });
      }
    });
  });
}
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

exports.thismonthMembership = async (req, res) => {
  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  buyMembership
    .aggregate([
      { $match: { userId: req.params.userId } },
      {
        $project: {
          membership_name: 1,
          membership_status: 1,
          expiry_date: { $toDate: "$expiry_date" },
          studentInfo: 1,
        }
      },
      {
        $lookup: {
          from: "members",
          localField: "studentInfo",
          foreignField: "_id",
          as: 'data'
        }
      },
      {
        $match: {
          $expr: { $eq: [{ $month: "$expiry_date" }, { $month: new Date() }] },
        }
      },
      {
        "$group": {
          _id: "$data._id",

          no_of_Memberships: { $sum: 1 },
          firstName: { "$first": '$data.firstName' },
          lastName: { "$first": '$data.lastName' },
          program: { "$first": '$data.program' },
          notes: { "$first": '$data.notes' },
          primaryPhone: { "$first": '$data.primaryPhone' },
          studentType: { "$first": '$data.studentType' },
          status: { "$first": '$data.status' },
          memberships: {
            "$push":
            {
              $cond: [{
                $eq: [{ $month: "$expiry_date" }, { $month: new Date() }]
              },
              {
                membership_name: "$membership_name", membership_status: "$membership_status", expiry_date: "$expiry_date", days_till_Expire: {
                  $multiply: [{
                    $floor: {
                      $divide: [{ $subtract: [new Date(), '$expiry_date'] }, 1000 * 60 * 60 * 24]
                    }
                  }, -1]

                }
              },
                "$$REMOVE"
              ]
            }
          }
        }
      },
      { $unwind: "$_id" },
      { $unwind: "$firstName" },
      { $unwind: "$lastName" },
      { $unwind: "$program" },
      { $unwind: "$notes" },
      { $unwind: "$primaryPhone" },
      { $unwind: "$studentType" },
      { $unwind: "$status" },
      {
        $sort: {
          firstName: 1
        }
      },
      {
        $facet: {
          paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
          totalCount: [
            {
              $count: 'count'
            }
          ]
        }
      }
    ])
    .exec((err, memberdata) => {
      if (err) {
        res.send({
          error: err,
        });
      } else {
        let data = memberdata[0].paginatedResults
        if (data.length > 0) {
          res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

        } else {
          res.send({ msg: 'data not found', success: false });
        }
      }
    });

};

exports.expiredMembership = async (req, res) => {
  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  buyMembership
    .aggregate([
      { $match: { userId: req.params.userId } },
      {
        $project: {
          membership_name: 1,
          membership_status: 1,
          expiry_date: { $toDate: "$expiry_date" },
          studentInfo: 1,
        }
      },
      {
        $lookup: {
          from: "members",
          localField: "studentInfo",
          foreignField: "_id",
          as: 'data'
        }
      },
      {
        $match: {
          expiry_date: { $lte: new Date() }
        }
      },
      {
        "$group": {
          _id: "$data._id",

          no_of_Memberships: { $sum: 1 },
          firstName: { "$first": '$data.firstName' },
          lastName: { "$first": '$data.lastName' },
          program: { "$first": '$data.program' },
          notes: { "$first": '$data.notes' },
          primaryPhone: { "$first": '$data.primaryPhone' },
          studentType: { "$first": '$data.studentType' },
          status: { "$first": '$data.status' },
          memberships: {
            "$push":
            {
              $cond: [
                { $lte: ["$expiry_date", new Date] },
                {
                  membership_name: "$membership_name", membership_status: "Expired", expiry_date: "$expiry_date", dayssince: {
                    $floor: {
                      $divide: [{ $subtract: [new Date(), '$expiry_date'] }, 1000 * 60 * 60 * 24]
                    }
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        }
      },
      { $unwind: "$_id" },
      { $unwind: "$firstName" },
      { $unwind: "$lastName" },
      { $unwind: "$program" },
      { $unwind: "$notes" },
      { $unwind: "$primaryPhone" },
      { $unwind: "$studentType" },
      { $unwind: "$status" },
      {
        $sort: {
          firstName: 1
        }
      },
      {
        $facet: {
          paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
          totalCount: [
            {
              $count: 'count'
            }
          ]
        }
      }
    ])
    .exec((err, memberdata) => {
      if (err) {
        res.send({
          error: err,
        });
      } else {
        let data = memberdata[0].paginatedResults
        if (data.length > 0) {
          res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

        } else {
          res.send({ msg: 'data not found', success: false });
        }
      }
    });
};
