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
  const subscription_id = req.body.subscription_id;
  try {
    if (req.body.isTerminate) {
      res.status(200).send({
        msg: "Membership already terminated!",
        success: true,
      });
    } else {
      if (type == "others") {
        await buyMembership.updateOne({ _id: membershipId }, req.body);
        res.status(200).send({
          msg: "Membership updated successfully!",
          success: true,
        });
      } else if (type == "freeze") {
        if (subscription_id) {
          const freezeValorPayload = await valorTechPaymentGateWay.freezeSubscription({subscription_id, freeze_start_date: req.body.freeze_start_date.split('-').join(''), freeze_stop_date: req.body.freeze_stop_date.split('-').join('')});
          if (freezeValorPayload?.data?.error_no === "S00") {
            const freezeRes = await freezeMembership(membershipId, req.body);
            if (freezeRes) {
              res.status(200).send({
                msg: "Membership freezed successfully",
                success: true,
              });
            } else {
              res.status(400).send({
                msg: "Membership not updated but valor freezed membership!",
                success: false,
              });
            }
          } else {
            res.status(400).send({
              msg:"Due to the technical issue subscription not freeze please try again or later!",
              success: false,
            });
          }
        } else {
          const freezeRes = await freezeMembership(membershipId, req.body);
          if (freezeRes) {
            res.status(200).send({
              msg: "Membership freezed successfully",
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
        if (subscription_id) {
          const valorRes = await valorTechPaymentGateWay.unfreezeSubscription({subscription_id});
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
        const emiId = req.body.emiId;
        const createdBy = req.body.createdBy;
        const balance = req.body.balance;
        let forfeit;
        if (subscription_id) {
          const {uid} = getUidAndInvoiceNumber()
          let valorRes = await valorTechPaymentGateWay.forfeitSubscription({subscription_id, uid})
          if (valorRes.data.error_no == "S00") {
            await paymentProcessing(membershipId, emiId, balance, createdBy, type);
            forfeit = await forfeitSubscription(membershipId, req.body.reason)
            if (forfeit.success) {
              res.status(200).send(forfeit)
            } else {
              res.status(400).send(forfeit)
            }
          } else {
            res.status(400).send({
              success: false,
              msg: "Membership forfeting failed please try again!"
            })
          }
        } else {
          await paymentProcessing(membershipId, emiId, balance, createdBy, type);
          forfeit = await forfeitSubscription(membershipId, req.body.reason)
          if (forfeit.success) {
            res.status(200).send(forfeit)
          } else {
            res.status(400).send(forfeit)
          }
        }
      } else if (type == "terminate") {
        let terminate;
        if (subscription_id) {
          const valorDelete = await valorTechPaymentGateWay.deleteSubscription({subscription_id});
          if (valorDelete.data.error_no === "S00") {
            terminate = await terminateMembership(membershipId, req.body.reason)
            if (terminate.success) {
              res.status(200).send(terminate)
            } else {
              res.status(400).send(terminate)
            }
          } else {
            res.send({
              msg: "Due to technical reason membership not terminating please try later!",
              success: false
            })
          }
        } else {
          terminate = await terminateMembership(membershipId, req.body.reason)
          if (terminate.success) {
            res.status(200).send(terminate)
          } else {
            res.status(400).send(terminate)
          }
        }
      } else if (type == "refund") {
        let refundRes;
        const balance = req.body.balance
        const emiId = req.body.emiId;
        const createdBy = req.body.createdBy;
        if (emiId) {
          await paymentProcessing(membershipId, emiId, balance, createdBy, type);
        }
        if (valorPayload) {
          const valorRefundRes =
            await valorTechPaymentGateWay.refundSubscription({
              ...valorPayload,
              amount: req.body.Amount,
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

function terminateMembership(membershipId, reason) {
  return new Promise((resolve, reject) => {
    buyMembership.findByIdAndUpdate(
      membershipId,
      {
        $set: { isTerminate: true, membership_status: "Terminated" },
        $push: {
          whenTerminate: {
            date: new Date(),
            reason: reason,
          },
        },
      },
      (err, data) => {
        if (err) {
          resolve({
            msg: "Membership terminate failed!",
            success: false,
          });
        } else {
          resolve({
            msg: "Membership terminated successfully",
            success: true,
          });
        }
      }
    );
  })
}

function forfeitSubscription(membershipId, reason) {
  return new Promise((resolve, reject) => {
    buyMembership.findByIdAndUpdate(
      membershipId,
      {
        $set: { isForfeit: true },
        $push: {
          whenForFeit: { date: new Date(), reason: reason },
        },
      },
      (er, data) => {
        if (er) {
          resolve({
            msg: "Membership forfeit failed!",
            success: false,
          });
        } else {
          resolve({
            msg: "Membership forfeit successfully!",
            success: true,
          });
        }
      }
    );
  })
}

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
        $set: { isRefund: true, membership_status: "Deactivated"},
        $push: {
          refund: {
            Amount: payload.Amount,
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
    const pay = await paymentProcessing(buy_membershipId, emiId, balance, createdBy, "paid");
    res.send(pay)
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

function paymentProcessing(buy_membershipId, emiId, balance, createdBy, type) {
  return new Promise((resolve, reject) => {
    buyMembership.updateOne(
      {
        _id: buy_membershipId,
        "schedulePayments.Id": emiId,
      },
      {
        $set: {
           balance: balance,
           membership_status: "Active",
          "schedulePayments.$.status": type,
          "schedulePayments.$.createdBy": createdBy,
          "schedulePayments.$.paidDate": new Date(),
        },
      },
      (err, data) => {
        if (err) {
          resolve({ error: err.message.replace(/\"/g, ""), success: false });
        } else {
          resolve({
            message: "Payment Successfully Updated!",
            success: true,
            error: false,
          });
        }
      }
    );
  })
}

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
  let valorPayload = req.body.membership_details.valorPayload;
  let membershipData = req.body.membership_details;
  const Address = valorPayload ? valorPayload.address : "";
  const payLatter = req.body.membership_details.pay_latter;
  const financeId = req.body.membership_details.financeId;
  const ptype = req.body.membership_details.ptype;
  delete req.body.membership_details.valorPayload;
  let memberShipDoc;
  membershipData.userId = userId;
  // console.log(membershipData, "PAYLOAD")
  // console.log(valorPayload, "VPP")
  // console.log(Address, "ADDD")
  // console.log(payLatter, "PAYLATTER")
  // console.log(ptype, "PAYMENT TYPE")
  try {
    if (membershipData.isEMI) {
      if (membershipData.payment_time > 0 && membershipData.balance > 0 && membershipData.payment_type != "pif") {
        membershipData.schedulePayments = createEMIRecord(
          membershipData.payment_time,
          membershipData.payment_money,
          membershipData.mactive_date,
          membershipData.createdBy,
          membershipData.payment_type,
          payLatter
        );
        if (valorPayload && ptype=="credit card") {
          valorPayload.descriptor = "BETA TESTING";
          valorPayload.product_description = "Mymember brand Product";
          // valorPayload.surchargeIndicator = 1;
          const { uid } = getUidAndInvoiceNumber();
          delete valorPayload.subscription_starts_from;
          delete valorPayload.Subscription_valid_for;
          let addValorPay = valorPayload;
          valorPayload = { ...valorPayload, uid };
          const saleFormatedPayload = getFormatedPayload(valorPayload);
          saleFormatedPayload.surchargeIndicator = 1;
          const resp = await valorTechPaymentGateWay.saleSubscription(
              saleFormatedPayload 
            );
          if (resp.data.error_no == 'S00') {
            if (payLatter === "credit card") {
              addValorPay = { ...addValorPay, amount: membershipData.payment_money, subscription_starts_from: membershipData.schedulePayments[0].date.split('-').join(''), Subscription_valid_for:membershipData.schedulePayments.length - 1, ...getUidAndInvoiceNumber() };
              const addFormatedPayload = getFormatedPayload(addValorPay);
              const addresp = await valorTechPaymentGateWay.addSubscription(
                addFormatedPayload
              );
              if (addresp.data.error_no ==="S00"){
                membershipData.subscription_id =  addresp.data.subscription_id
              } else {
                membershipData.subscription_id =  "failed" 
              }
            }
            membershipData.transactionId = {
                  rrn: resp.data.rrn,
                  txnid: resp.data.txnid,
                  token: resp.data.token,
                };
            valorPayload.address = Address;
            valorPayload.userId = userId;
            valorPayload.studentId = studentId;
            const financeDoc = await createFinanceDoc(valorPayload, financeId);
            if (financeDoc.success) {
              membershipData.membership_status = "Active";
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
            res.send({ msg: resp.data.mesg, success: false });
          }
        } else {
          membershipData.membership_status = "Active";
          memberShipDoc = await createMemberShipDocument(
            membershipData,
            studentId
          );
          res.send(memberShipDoc);
        }
      } else {
        res.send({
          msg: "payment type should be weekly/monthly",
          success: false,
        });
      }
    } else {
      membershipData.due_status = "paid";
      membershipData.membership_status = "Active";
      if (!membershipData.isEMI && membershipData.balance == 0 && ptype === 'credit card') {
        if (valorPayload.pan) {
          const { uid } = getUidAndInvoiceNumber();
          valorPayload = { ...valorPayload, uid };
          valorPayload.surchargeIndicator = 1;
          const FormatedPayload = getFormatedPayload(valorPayload);
          const resp = await valorTechPaymentGateWay.saleSubscription(
            FormatedPayload
          );

          if (resp.data.error_no === "S00") {
            membershipData.transactionId = {
              rrn: resp.data.rrn,
              txnid: resp.data.txnid,
              token: resp.data.token,
            };
            valorPayload.address = Address;
            valorPayload.userId = userId;
            valorPayload.studentId = studentId;
            const financeDoc = await createFinanceDoc(valorPayload, financeId);
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
            res.send({ msg: resp.data.mesg, success: false });
          }
        } else {
          memberShipDoc = await createMemberShipDocument(
            membershipData,
            studentId
          );
          res.send(memberShipDoc);
        }
      } else {
        memberShipDoc = await createMemberShipDocument(
          membershipData,
          studentId
        );
        res.send(memberShipDoc);
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
  let subscriptionAddress;
  if (payload.Subscription_valid_for) {
    subscriptionAddress = {
      shipping_customer_name: payload.card_holder_name,
      shipping_street_no: address.street_no,
      shipping_street_name: address.address,
      shipping_zip: address.zip,
      billing_customer_name: payload.card_holder_name ,
      billing_street_no: address.street_no,
      billing_street_name: address.address,
      billing_zip: address.zip,
    }
    return {
      ...payload,
      ...subscriptionAddress
    }
  }
  delete payload.subscription_day_of_the_month;
  delete payload.Subscription_valid_for;
  delete payload.subscription_starts_from;
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
              resolve({
                msg: "membership id is not add in student",
                success: false,
              });
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
                      success: false,
                    });
                  } else {
                    resolve({
                      msg: "membership purchase successfully",
                      data: result,
                      success: true,
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

function createFinanceDoc(data, financeId) {
  const {studentId} = data;
  return new Promise((resolve, reject) => {
    const financeData = new Finance_infoSchema(data);
    if (financeId) {
      Finance_infoSchema.findByIdAndUpdate(financeId, {
        $set: data
      }).exec((err, resData) => {
        if (err) {
          resolve({ success: false });
        }
        resolve({ success: true });
      })
    } else {
      financeData.save((err, Fdata) => {
        if (err) {
          resolve({ success: false, msg: "Finance data is not stored!" });
        } else {
          AddMember.findByIdAndUpdate(studentId, {
            $push: { finance_details: Fdata._id },
          }).exec((err, data) => {
            if (data) {
              resolve({ success: true });
            } else {
              resolve({ success: false });
            }
          });
        }
      });
    }
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
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "studentInfo",
          foreignField: "_id",
          as: "data",
        },
      },
      {
        $match: {
          $expr: { $eq: [{ $month: "$expiry_date" }, { $month: new Date() }] },
        },
      },
      {
        $group: {
          _id: "$data._id",

          no_of_Memberships: { $sum: 1 },
          firstName: { $first: "$data.firstName" },
          lastName: { $first: "$data.lastName" },
          program: { $first: "$data.program" },
          notes: { $first: "$data.notes" },
          primaryPhone: { $first: "$data.primaryPhone" },
          studentType: { $first: "$data.studentType" },
          status: { $first: "$data.status" },
          memberships: {
            $push: {
              $cond: [
                {
                  $eq: [{ $month: "$expiry_date" }, { $month: new Date() }],
                },
                {
                  membership_name: "$membership_name",
                  membership_status: "$membership_status",
                  expiry_date: "$expiry_date",
                  days_till_Expire: {
                    $multiply: [
                      {
                        $floor: {
                          $divide: [
                            { $subtract: [new Date(), "$expiry_date"] },
                            1000 * 60 * 60 * 24,
                          ],
                        },
                      },
                      -1,
                    ],
                  },
                },
                "$$REMOVE",
              ],
            },
          },
        },
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
          firstName: 1,
        },
      },
      {
        $facet: {
          paginatedResults: [
            { $skip: pagination.skip },
            { $limit: pagination.limit },
          ],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ])
    .exec((err, memberdata) => {
      if (err) {
        res.send({
          error: err,
        });
      } else {
        let data = memberdata[0].paginatedResults;
        if (data.length > 0) {
          res.send({
            data: data,
            totalCount: memberdata[0].totalCount[0].count,
            success: true,
          });
        } else {
          res.send({ msg: "data not found", success: false });
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
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "studentInfo",
          foreignField: "_id",
          as: "data",
        },
      },
      {
        $match: {
          expiry_date: { $lte: new Date() },
        },
      },
      {
        $group: {
          _id: "$data._id",

          no_of_Memberships: { $sum: 1 },
          firstName: { $first: "$data.firstName" },
          lastName: { $first: "$data.lastName" },
          program: { $first: "$data.program" },
          notes: { $first: "$data.notes" },
          primaryPhone: { $first: "$data.primaryPhone" },
          studentType: { $first: "$data.studentType" },
          status: { $first: "$data.status" },
          memberships: {
            $push: {
              $cond: [
                { $lte: ["$expiry_date", new Date()] },
                {
                  membership_name: "$membership_name",
                  membership_status: "Expired",
                  expiry_date: "$expiry_date",
                  dayssince: {
                    $floor: {
                      $divide: [
                        { $subtract: [new Date(), "$expiry_date"] },
                        1000 * 60 * 60 * 24,
                      ],
                    },
                  },
                },
                "$$REMOVE",
              ],
            },
          },
        },
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
          firstName: 1,
        },
      },
      {
        $facet: {
          paginatedResults: [
            { $skip: pagination.skip },
            { $limit: pagination.limit },
          ],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ])
    .exec((err, memberdata) => {
      if (err) {
        res.send({
          error: err,
        });
      } else {
        let data = memberdata[0].paginatedResults;
        if (data.length > 0) {
          res.send({
            data: data,
            totalCount: memberdata[0].totalCount[0].count,
            success: true,
          });
        } else {
          res.send({ msg: "data not found", success: false });
        }
      }
    });
};
