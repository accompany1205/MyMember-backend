const membershipModal = require("../models/membership");
const moment = require("moment");
const buyMembership = require("../models/buy_membership");
const Finance_infoSchema = require("../models/finance_info");
const AddMember = require("../models/addmember");
const StripeApis = require("../Services/stripe");
const StripeCards = require('../models/stripe_cards')
const StripeCustomers = require('../models/stripe_customers')
const StoreTransaction = require('../models/store_transactions')
const User = require('../models/user');
const _ = require("lodash");
const Joi = require("@hapi/joi");
var mongo = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { valorTechPaymentGateWay } = require("./valorTechPaymentGateWay");
const daysRemaining = require("../controllers/remainingdays");
//const daysRemaining = require("../Services/daysremaining");

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
  const cardDetails = req.body.cardDetails;
  let expiry_date = "";
  if (cardDetails) {
    expiry_date =
      toString(cardDetails.expiry_month) + toString(cardDetails.expiry_year);
    delete cardDetails.expiry_month;
    delete cardDetails.expiry_year;
    cardDetails.expiry_date = expiry_date;
  }
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
          const freezeValorPayload =
            await valorTechPaymentGateWay.freezeSubscription({
              app_id: req.valorCredfreeze_stop_dateentials.app_id,
              auth_key: req.valorCredentials.auth_key,
              epi: req.valorCredentials.epi,
              subscription_id,
              freeze_start_date: req.body.freeze_start_date.split("-").join(""),
              freeze_stop_date: req.body.freeze_stop_date.split("-").join(""),
            });
          if (freezeValorPayload?.data?.error_no === "S00") {
            const freezeRes = await freezeMembership(membershipId, req.body);
            if (freezeRes) {
              res.status(200).send({
                msg: "Membership freezed successfully",
                success: true,
              });
            } else {  
              console.log("i am here");
              res.status(400).send({
                msg: "Membership not updated but valor freezed membership!",
                success: false,
              });
            }
          } else {
            res.status(400).send({
              msg: "Due to the technical issue subscription not freeze please try again or later!",
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
            console.log("NO i am here");
            res.status(400).send({
              msg: "Membership not freezed please try again!",
              success: false,
            });
          }
        }
      } else if (type == "unfreeze") {
        let unfreezeRes;
        if (subscription_id) {
          const valorRes = await valorTechPaymentGateWay.unfreezeSubscription({
            app_id: req.valorCredentials.app_id,
            auth_key: req.valorCredentials.auth_key,
            epi: req.valorCredentials.epi,
            subscription_id,
          });
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
          const { uid } = getUidAndInvoiceNumber();
          let valorRes = await valorTechPaymentGateWay.forfeitSubscription({
            app_id: req.valorCredentials.app_id,
            auth_key: req.valorCredentials.auth_key,
            epi: req.valorCredentials.epi,
            subscription_id,
            uid,
          });
          if (valorRes.data.error_no == "S00") {
            await paymentProcessing(
              membershipId,
              emiId,
              balance,
              createdBy,
              type,
              req.body.ptype
            );
            forfeit = await forfeitSubscription(membershipId, req.body.reason);
            if (forfeit.success) {
              res.status(200).send(forfeit);
            } else {
              res.status(400).send(forfeit);
            }
          } else {
            res.status(400).send({
              success: false,
              msg: "Membership forfeting failed please try again!",
            });
          }
        } else {
          await paymentProcessing(
            membershipId,
            emiId,
            balance,
            createdBy,
            type,
            req.body.ptype
          );
          forfeit = await forfeitSubscription(membershipId, req.body.reason);
          if (forfeit.success) {
            res.status(200).send(forfeit);
          } else {
            res.status(400).send(forfeit);
          }
        }
      } else if (type == "terminate") {
        let terminate;
        if (subscription_id) {
          const valorDelete = await valorTechPaymentGateWay.deleteSubscription({
            app_id: req.valorCredentials.app_id,
            auth_key: req.valorCredentials.auth_key,
            epi: req.valorCredentials.epi,
            subscription_id,
          });
          if (valorDelete.data.error_no === "S00") {
            terminate = await terminateMembership(
              membershipId,
              req.body.reason
            );
            if (terminate.success) {
              res.status(200).send(terminate);
            } else {
              res.status(400).send(terminate);
            }
          } else {
            res.send({
              msg: "Due to technical reason membership not terminating please try later!",
              success: false,
            });
          }
        } else {
          terminate = await terminateMembership(membershipId, req.body.reason);
          if (terminate) {
            res.status(200).send({
              msg: "Membership terminated successfully",
              success: true,
            });
          } else {
            res.status(400).send({
              msg: "Membership terminate failed!",
              success: false,
            });
          }
        }
      } else if (type == "refund") {
        let refundRes;
        const balance = req.body.balance;
        const emiId = req.body.emiId;
        const createdBy = req.body.createdBy;
        if (cardDetails) {
          const { uid } = getUidAndInvoiceNumber();
          const valorRefundRes =
            await valorTechPaymentGateWay.refundSubscription({
              app_id: req.valorCredentials.app_id,
              auth_key: req.valorCredentials.auth_key,
              epi: req.valorCredentials.epi,
              ...cardDetails,
              uid,
              amount: req.body.Amount,
            });
          if (valorRefundRes.data.error_no === "S00") {
            if (emiId) {
              await paymentProcessing(
                membershipId,
                emiId,
                balance,
                createdBy,
                type,
                req.body.ptype
              );
            }
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
          if (emiId) {
            await paymentProcessing(
              membershipId,
              emiId,
              balance,
              createdBy,
              type,
              req.body.ptype
            );
          }
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
          resolve(false);
        } else {
          lastestMembership(membershipId, "Terminated")
            .then((data) => resolve(data))
            .catch((err) => resolve(false));
        }
      }
    );
  });
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
            Amount: payload.Amount,
            date: new Date(),
            reason: payload.reason,
            refund_method: payload.payment_type,
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

async function freezeUnfreeze(membershipId, status) {
  const currentMembership = await AddMember.aggregate([
    {
      $match: {
        membership_details: {
          $exists: true,
          $ne: [],
        },
      },
    },
    {
      $project: {
        _id: 0,
        membership_details: {
          $arrayElemAt: ["$membership_details", -1],
        },
      },
    },
    {
      $match: {
        membership_details: ObjectId(membershipId),
      },
    },
  ])
  if (currentMembership.length === 1) {
    if ((currentMembership[0].membership_details).toString() === membershipId.toString()) {
      await AddMember.updateOne({ _id: (currentMembership[0].membership_details).toString() }, { $set: { status: status } })
    }
  } else {
    console.log('there is no data')
  }
}

async function freezeMembership(membershipId, payload) {
  await freezeUnfreeze(membershipId, "Freeze")

  return new Promise((resolve, reject) => {
    let expiry_date = moment(payload.expiry_date)
      .add(daysRemaining(payload.freeze_stop_date,payload.freeze_start_date), "days")
      .format("YYYY-MM-DD");
    buyMembership
      .findByIdAndUpdate(membershipId, {
        $set: {
          isFreeze: true,
          membership_status: "Freeze",
          expiry_date: expiry_date,
        },
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
          reject(false);
        } else {
          lastestMembership(membershipId, "Freeze", expiry_date)
            .then((data) => resolve(data))
            .catch((err) => resolve(false));
        }
      });
  });

}

async function unFreezeMembership(membershipId, payload) {

  await freezeUnfreeze(membershipId, "Active");
  let data=await buyMembership.aggregate([
    {
      $match:{
        _id:ObjectId(membershipId)
      }
    },
    {
      $project:{
        expiry_date:1,
        whenFreeze:1
      }
    },
    { $addFields: { lastElem: { $last: "$whenFreeze" } } }
  ])
  let last=""
  for(let i of data[0].whenFreeze){
    if( i.hasOwnProperty('freeze_stop_date')){
      last=i.freeze_stop_date
    }
  }
  let expiryDate=data[0].expiry_date
  let date=moment(new Date()).format('YYYY-MM-DD'); 
  return new Promise((resolve, reject) => {
    let expiry_date = moment(expiryDate)
      .subtract(daysRemaining(last,date), "days")
      .format("YYYY-MM-DD");
    buyMembership
      .findByIdAndUpdate(membershipId, {
        $set: { isFreeze: false, membership_status: "Active",expiry_date:expiry_date },
        $push: {
          whenFreeze: { date: new Date(), reason: payload.reason },
        },
      })
      .exec((err, data) => {
        if (err) {
          resolve(false);
        } else {
          lastestMembership(membershipId, "Active")
            .then((data) => resolve(data))
            .catch((err) => resolve(false));
        }
      });
  });
}

function lastestMembership(membershipID, status, expiry_date) {
  return new Promise((resolve, reject) => {
    AddMember.aggregate([
      {
        $match: {
          membership_details: {
            $exists: true,
            $ne: [],
          },
        },
      },
      {
        $project: {
          membership_details: {
            $arrayElemAt: ["$membership_details", -1],
          },
        },
      },
      {
        $match: {
          membership_details: ObjectId(membershipID),
        },
      },
    ]).exec((err, data) => {
      if (err) {
        resolve(false);
      } else {
        if (data.length) {
          AddMember.findByIdAndUpdate(data[0]._id, {
            $set: { status, membership_expiry: expiry_date },
          })
            .then((resp) => resolve(true))
            .catch((err) => resolve(false));
        } else {
          resolve(true);
        }
      }
    });
  });
}
// lastestMembership("62a7d81e33d5150a232445c4");

exports.updatePayments = async (req, res) => {
  try {
    const buy_membershipId = req.params.membershipId;
    const emiId = req.params.emiID;
    const createdBy = req.body.createdBy;
    const balance = req.body.balance - req.body.Amount;
    const subscription_id = req.body.subscription_id;
    const ptype = req.body.ptype;
    const payment_type = req.body.payment_type;
    const cardDetails = req.body.cardDetails;
    let expiry_date = "";
    if (cardDetails) {
      expiry_date = cardDetails.expiry_month + cardDetails.expiry_year;
      delete cardDetails.expiry_month;
      delete cardDetails.expiry_year;
      cardDetails.expiry_date = expiry_date;
    }

    const { uid } = getUidAndInvoiceNumber();
    if (cardDetails) {
      const valorPayload = { ...cardDetails, uid, amount: req.body.Amount };
      valorPayload.app_id = req.valorCredentials.app_id;
      valorPayload.auth_key = req.valorCredentials.auth_key;
      valorPayload.epi = req.valorCredentials.epi;
      const resp = await valorTechPaymentGateWay.saleSubscription(valorPayload);
      if (resp.data.error_no == "S00") {
        const pay = await paymentProcessing(
          buy_membershipId,
          emiId,
          balance,
          createdBy,
          "paid",
          payment_type,
          req.body.cheque_number
        );
        res.send(pay);
      } else {
        res.send({
          success: false,
          msg: "Payment is not completed due to technical reason please try again!",
        });
      }
    } else {
      const pay = await paymentProcessing(
        buy_membershipId,
        emiId,
        balance,
        createdBy,
        "paid",
        payment_type,
        req.body.cheque_number
      );
      res.send(pay);
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

function paymentProcessing(
  buy_membershipId,
  emiId,
  balance,
  createdBy,
  type,
  ptype,
  check_number = ""
) {
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
          "schedulePayments.$.ptype": ptype,
          "schedulePayments.$.cheque_number": check_number,
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
  });
}

exports.remove = (req, res) => {
  const id = req.params.membershipId;
  buyMembership
    .deleteOne({ _id: id })
    .then((resp) => {
      AddMember.updateOne(
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

exports.buyMembership = async (req, res) => {
  const userId = req.params.userId;
  const studentId = req.params.studentId;
  let valorPayload = req.body.membership_details.valorPayload
    ? req.body.membership_details.valorPayload
    : {};
  valorPayload.app_id = req.valorCredentials.app_id;
  valorPayload.auth_key = req.valorCredentials.auth_key;
  valorPayload.epi = req.valorCredentials.epi;
  let membershipData = req.body.membership_details;
  const Address = valorPayload ? valorPayload.address : "";
  const payLatter = req.body.membership_details.pay_latter;
  const financeId = req.body.membership_details.financeId
    ? req.body.membership_details.financeId
    : 1;
  const ptype = req.body.membership_details.ptype;
  delete req.body.membership_details.valorPayload;
  let memberShipDoc;
  membershipData.userId = userId;
  try {
    if (membershipData.isEMI) {
      if (
        membershipData.payment_time > 0 &&
        membershipData.balance > 0
        //  && membershipData.payment_type != 'pif'
      ) {
        membershipData.schedulePayments = createEMIRecord(
          membershipData.payment_time,
          membershipData.payment_money,
          membershipData.mactive_date,
          membershipData.createdBy,
          membershipData.payment_type,
          membershipData.pay_latter,
          membershipData.due_every
        );
        if (valorPayload && ptype == "credit card") {
          valorPayload.descriptor = "BETA TESTING";
          valorPayload.product_description = "Mymember brand Product";
          const { uid } = getUidAndInvoiceNumber();
          delete valorPayload.subscription_starts_from;
          delete valorPayload.Subscription_valid_for;
          let addValorPay = valorPayload;
          valorPayload = { ...valorPayload, uid };
          const saleFormatedPayload = getFormatedPayload(valorPayload);
          const resp = await valorTechPaymentGateWay.saleSubscription(
            saleFormatedPayload
          );
          // console.log(resp.data);
          if (resp.data.error_no == "S00") {
            if (
              payLatter === "credit card" &&
              (membershipData.payment_type === "monthly" ||
                membershipData.payment_type === "weekly")
            ) {
              addValorPay = {
                ...addValorPay,
                amount: membershipData.payment_money,
                subscription_starts_from:
                  membershipData.schedulePayments[0].date.split("-").join(""),
                Subscription_valid_for:
                  membershipData.schedulePayments.length - 1,
                ...getUidAndInvoiceNumber(),
              };
              const addFormatedPayload = getFormatedPayload(addValorPay);
              const addresp = await valorTechPaymentGateWay.addSubscription(
                addFormatedPayload
              );
              // console.log(addresp.data);
              if (addresp.data.error_no === "S00") {
                membershipData.subscription_id = addresp.data.subscription_id;
                membershipData.transactionId = {
                  rrn: resp.data.rrn,
                  txnid: resp.data.txnid,
                  token: resp.data.token,
                };

                if (!financeId) {
                  valorPayload.address = Address;
                  valorPayload.userId = userId;
                  valorPayload.studentId = studentId;
                  const financeDoc = await createFinanceDoc(valorPayload);
                  if (financeDoc.success) {
                    membershipData.membership_status = "Active";
                    memberShipDoc = await createMemberShipDocument(
                      membershipData,
                      studentId
                    );
                    return res.send(memberShipDoc);
                  } else {
                    res.send({
                      msg: "Finance and membership doc not created!",
                      success: false,
                    });
                  }
                }

                membershipData.membership_status = "Active";
                memberShipDoc = await createMemberShipDocument(
                  membershipData,
                  studentId
                );
                res.send(memberShipDoc);
              } else {
                res.send({
                  msg: addresp.data.mesg ? addresp.data.mesg : addresp.data.msg,
                  success: false,
                });
              }
            } else {
              // paylater with cash/cheque
              if (!financeId) {
                valorPayload.address = Address;
                valorPayload.userId = userId;
                valorPayload.studentId = studentId;
                const financeDoc = await createFinanceDoc(valorPayload);
                if (financeDoc.success) {
                  membershipData.membership_status = "Active";
                  memberShipDoc = await createMemberShipDocument(
                    membershipData,
                    studentId
                  );
                  return res.send(memberShipDoc);
                } else {
                  res.send({
                    msg: "Finance and membership doc not created!",
                    success: false,
                  });
                }
              }
              membershipData.membership_status = "Active";
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              return res.send(memberShipDoc);
            }
          } else {
            res.send({ msg: resp.data.mesg, success: false });
          }
        } else if (ptype === "cash" || ptype === "cheque") {
          if (
            payLatter === "credit card" &&
            (membershipData.payment_type === "monthly" ||
              membershipData.payment_type === "weekly")
          ) {
            valorPayload.descriptor = "BETA TESTING";
            valorPayload.product_description = "Mymember brand Product";
            const { uid } = getUidAndInvoiceNumber();
            delete valorPayload.subscription_starts_from;
            delete valorPayload.Subscription_valid_for;
            let addValorPay = valorPayload;
            addValorPay = {
              ...addValorPay,
              amount: membershipData.payment_money,
              subscription_starts_from: membershipData.schedulePayments[0].date
                .split("-")
                .join(""),
              Subscription_valid_for:
                membershipData.schedulePayments.length - 1,
              ...getUidAndInvoiceNumber(),
            };
            const addFormatedPayload = getFormatedPayload(addValorPay);
            const addresp = await valorTechPaymentGateWay.addSubscription(
              addFormatedPayload
            );
            // console.log(addresp.data);
            if (addresp.data.error_no === "S00") {
              membershipData.subscription_id = addresp.data.subscription_id;
              membershipData.transactionId = {
                payment_type: "cash",
              };
              // console.log('isdnjv');

              if (!financeId) {
                valorPayload.address = Address;
                valorPayload.userId = userId;
                valorPayload.studentId = studentId;
                const financeDoc = await createFinanceDoc(valorPayload);
                if (financeDoc.success) {
                  membershipData.membership_status = "Active";
                  memberShipDoc = await createMemberShipDocument(
                    membershipData,
                    studentId
                  );
                  return res.send(memberShipDoc);
                } else {
                  res.send({
                    msg: "Finance and membership doc not created!",
                    success: false,
                  });
                }
              }

              membershipData.membership_status = "Active";
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              res.send(memberShipDoc);
            } else {
              res.send({
                msg: addresp.data.mesg ? addresp.data.mesg : addresp.data.msg,
                success: false,
              });
            }
          }

          if (!financeId) {
            valorPayload.address = Address;
            valorPayload.userId = userId;
            valorPayload.studentId = studentId;
            const financeDoc = await createFinanceDoc(valorPayload);
            if (financeDoc.success) {
              membershipData.membership_status = "Active";
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              return res.send(memberShipDoc);
            } else {
              res.send({
                msg: "Finance and membership doc not created!",
                success: false,
              });
            }
          }
          membershipData.membership_status = "Active";
          memberShipDoc = await createMemberShipDocument(
            membershipData,
            studentId
          );
          return res.send(memberShipDoc);
        } else {
          res.send({
            msg: "payment mode should be cash/cheque or credit card",
            success: false,
          });
        }
      } else {
        res.send({
          msg: "payment type should be weekly/monthly",
          success: false,
        });
      }
    } else {
      if (
        !membershipData.isEMI &&
        membershipData.balance == 0
        // && membershipData.payment_type == 'pif'
      ) {
        membershipData.due_status = "paid";
        membershipData.membership_status = "Active";
        if (valorPayload && ptype === "credit card") {
          if (valorPayload.pan) {
            const { uid } = getUidAndInvoiceNumber();
            valorPayload = { ...valorPayload, uid };
            const FormatedPayload = getFormatedPayload(valorPayload);
            const resp = await valorTechPaymentGateWay.saleSubscription(
              FormatedPayload
            );
            // console.log(resp.data);
            if (resp.data.error_no === "S00") {
              membershipData.transactionId = {
                rrn: resp.data.rrn,
                txnid: resp.data.txnid,
                token: resp.data.token,
              };
              if (!financeId) {
                valorPayload.address = Address;
                valorPayload.userId = userId;
                valorPayload.studentId = studentId;
                const financeDoc = await createFinanceDoc(valorPayload);
                if (financeDoc.success) {
                  memberShipDoc = await createMemberShipDocument(
                    membershipData,
                    studentId
                  );

                  return res.send(memberShipDoc);
                } else {
                  res.send({
                    msg: "Finace and membership doc not created!",
                    success: false,
                  });
                }
              }
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              return res.send(memberShipDoc);
            } else {
              res.send({ msg: resp.data.mesg, success: false });
            }
          } else {
            res.send({
              msg: "please provide Card Detatils",
              success: false,
            });
          }
        } else if (ptype === ("cash" || "cheque")) {
          if (!financeId) {
            valorPayload.address = Address;
            valorPayload.userId = userId;
            valorPayload.studentId = studentId;
            const financeDoc = await createFinanceDoc(valorPayload);
            if (financeDoc.success) {
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              return res.send(memberShipDoc);
            } else {
              res.send({
                msg: "Finace and membership doc not created!",
                success: false,
              });
            }
          }

          memberShipDoc = await createMemberShipDocument(
            membershipData,
            studentId
          );
          return res.send(memberShipDoc);
        }
      } else {
        res.send({
          msg: "payment type should be Pif or Monthly/Weekly",
          success: false,
        });
      }
    }
  } catch (error) {
    res.send({ msg: error.message.replace(/\"/g, ""), success: false });
  }
};

let createCardToken = async (body, resp) => {
  let cardNumber = body.cardNumber
  let cardExpiryMonth = body.cardExpiryMonth
  let cardExpiryYear = body.cardExpiryYear
  let cardCvc = body.cardCvc

  let cardToken = await resp.tokens.create({
      card: {
          number: cardNumber,
          exp_month: cardExpiryMonth,
          exp_year: cardExpiryYear,
          cvc: cardCvc,
      },
  });
  return cardToken
};

let createPayment = async (req, resp) => {
  try {
      let findCustomer = await StripeCustomers.findOne({ "email": req.body.email })
      if (findCustomer == null) {
          throw { "status": false, "message": "customer not existed" }
      }
      console.log("amount is ------------", req.body.amount, req.body.card_id,)
      let paymentIntent = await resp.paymentIntents.create({
          amount: (req.body.amount) * 100, //stripe uses cents
          currency: 'usd',
          customer: findCustomer.get("id"),
          payment_method_types: ['card'],
          payment_method: req.body.card_id,
          confirm: "true",
          description: req.body.description
      });
      let storeTransaction = await StoreTransaction.create(paymentIntent)
      console.log(paymentIntent)
      return paymentIntent
  }
  catch (err) {
      return err
  }
};


let createCard = async (req, resp) => {
  try {
      let cardNumber = req.body.card_number
      let cardExpiryMonth = req.body.card_expiry_month
      let cardExpiryYear = req.body.card_expiry_year
      let cardCvc = req.body.card_cvc
      let email = req.body.email
      let phone = req.body.phone
      let cardToken = await createCardToken({ cardNumber, cardExpiryMonth, cardExpiryYear, cardCvc }, resp)
      let findCustomer = await StripeCustomers.findOne({ "email": email })
      let customerId
      let cardCheck = await StripeCards.findOne({ "card_number": cardNumber, "email": email })
      if (cardCheck) {
          return { "status": false, "message": "card already existed with this customer email" }
      }
      if (findCustomer == null) {
          return { "status": false, "message": "customer not existed" }
      }
      else {
          customerId = findCustomer.id
      }
      let cardId = await resp.customers.createSource(
          customerId,
          { source: cardToken.id }
      );
      let storeCard = StripeCards.create(
          {
              "customer_id": customerId,
              "card_id": cardId.id,
              "card_number": cardNumber,
              "email": email,
              "phone": phone
          }
      )

      return cardId
  }
  catch (error) {
      console.log("--------------", JSON.parse(JSON.stringify(error)))
      return error
  }
};
exports.buyMembershipStripe = async (req, res) => {
  const userId = req.params.userId;
  let {stripe_sec} = await User.findOne({_id:userId});
  const studentId = req.params.studentId;
  let stripePayload = req.body.membership_details.stripePayload
    ? req.body.membership_details.stripePayload
    : {};
  let membershipData = req.body.membership_details;
  const Address = stripePayload ? stripePayload.address : "";
  const payLatter = req.body.membership_details.pay_latter;
  const financeId = req.body.membership_details.financeId
    ? req.body.membership_details.financeId
    : 1;
  const ptype = req.body.membership_details.ptype;
  delete req.body.membership_details.stripePayload;
  let memberShipDoc;
  membershipData.userId = userId;
  try {
    if (membershipData.isEMI) {
      if (
        membershipData.payment_time > 0 &&
        membershipData.balance > 0
        //  && membershipData.payment_type != 'pif'
      ) {
        membershipData.schedulePayments = createEMIRecord(
          membershipData.payment_time,
          membershipData.payment_money,
          membershipData.mactive_date,
          membershipData.createdBy,
          membershipData.payment_type,
          membershipData.pay_latter,
          membershipData.due_every
        );
        if (valorPayload && ptype == "credit card") {
          valorPayload.descriptor = "BETA TESTING";
          valorPayload.product_description = "Mymember brand Product";
          const { uid } = getUidAndInvoiceNumber();
          delete valorPayload.subscription_starts_from;
          delete valorPayload.Subscription_valid_for;
          let addValorPay = valorPayload;
          valorPayload = { ...valorPayload, uid };
          const saleFormatedPayload = getFormatedPayload(valorPayload);
          const resp = await valorTechPaymentGateWay.saleSubscription(
            saleFormatedPayload
          );
          // console.log(resp.data);
          if (resp.data.error_no == "S00") {
            if (
              payLatter === "credit card" &&
              (membershipData.payment_type === "monthly" ||
                membershipData.payment_type === "weekly")
            ) {
              addValorPay = {
                ...addValorPay,
                amount: membershipData.payment_money,
                subscription_starts_from:
                  membershipData.schedulePayments[0].date.split("-").join(""),
                Subscription_valid_for:
                  membershipData.schedulePayments.length - 1,
                ...getUidAndInvoiceNumber(),
              };
              const addFormatedPayload = getFormatedPayload(addValorPay);
              const addresp = await valorTechPaymentGateWay.addSubscription(
                addFormatedPayload
              );
              // console.log(addresp.data);
              if (addresp.data.error_no === "S00") {
                membershipData.subscription_id = addresp.data.subscription_id;
                membershipData.transactionId = {
                  rrn: resp.data.rrn,
                  txnid: resp.data.txnid,
                  token: resp.data.token,
                };

                if (!financeId) {
                  valorPayload.address = Address;
                  valorPayload.userId = userId;
                  valorPayload.studentId = studentId;
                  const financeDoc = await createFinanceDoc(valorPayload);
                  if (financeDoc.success) {
                    membershipData.membership_status = "Active";
                    memberShipDoc = await createMemberShipDocument(
                      membershipData,
                      studentId
                    );
                    return res.send(memberShipDoc);
                  } else {
                    res.send({
                      msg: "Finance and membership doc not created!",
                      success: false,
                    });
                  }
                }

                membershipData.membership_status = "Active";
                memberShipDoc = await createMemberShipDocument(
                  membershipData,
                  studentId
                );
                res.send(memberShipDoc);
              } else {
                res.send({
                  msg: addresp.data.mesg ? addresp.data.mesg : addresp.data.msg,
                  success: false,
                });
              }
            } else {
              // paylater with cash/cheque
              if (!financeId) {
                valorPayload.address = Address;
                valorPayload.userId = userId;
                valorPayload.studentId = studentId;
                const financeDoc = await createFinanceDoc(valorPayload);
                if (financeDoc.success) {
                  membershipData.membership_status = "Active";
                  memberShipDoc = await createMemberShipDocument(
                    membershipData,
                    studentId
                  );
                  return res.send(memberShipDoc);
                } else {
                  res.send({
                    msg: "Finance and membership doc not created!",
                    success: false,
                  });
                }
              }
              membershipData.membership_status = "Active";
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              return res.send(memberShipDoc);
            }
          } else {
            res.send({ msg: resp.data.mesg, success: false });
          }
        } else if (ptype === "cash" || ptype === "cheque") {
          if (
            payLatter === "credit card" &&
            (membershipData.payment_type === "monthly" ||
              membershipData.payment_type === "weekly")
          ) {
            valorPayload.descriptor = "BETA TESTING";
            valorPayload.product_description = "Mymember brand Product";
            const { uid } = getUidAndInvoiceNumber();
            delete valorPayload.subscription_starts_from;
            delete valorPayload.Subscription_valid_for;
            let addValorPay = valorPayload;
            addValorPay = {
              ...addValorPay,
              amount: membershipData.payment_money,
              subscription_starts_from: membershipData.schedulePayments[0].date
                .split("-")
                .join(""),
              Subscription_valid_for:
                membershipData.schedulePayments.length - 1,
              ...getUidAndInvoiceNumber(),
            };
            const addFormatedPayload = getFormatedPayload(addValorPay);
            const addresp = await valorTechPaymentGateWay.addSubscription(
              addFormatedPayload
            );
            // console.log(addresp.data);
            if (addresp.data.error_no === "S00") {
              membershipData.subscription_id = addresp.data.subscription_id;
              membershipData.transactionId = {
                payment_type: "cash",
              };
              // console.log('isdnjv');

              if (!financeId) {
                valorPayload.address = Address;
                valorPayload.userId = userId;
                valorPayload.studentId = studentId;
                const financeDoc = await createFinanceDoc(valorPayload);
                if (financeDoc.success) {
                  membershipData.membership_status = "Active";
                  memberShipDoc = await createMemberShipDocument(
                    membershipData,
                    studentId
                  );
                  return res.send(memberShipDoc);
                } else {
                  res.send({
                    msg: "Finance and membership doc not created!",
                    success: false,
                  });
                }
              }

              membershipData.membership_status = "Active";
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              res.send(memberShipDoc);
            } else {
              res.send({
                msg: addresp.data.mesg ? addresp.data.mesg : addresp.data.msg,
                success: false,
              });
            }
          }

          if (!financeId) {
            valorPayload.address = Address;
            valorPayload.userId = userId;
            valorPayload.studentId = studentId;
            const financeDoc = await createFinanceDoc(valorPayload);
            if (financeDoc.success) {
              membershipData.membership_status = "Active";
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              return res.send(memberShipDoc);
            } else {
              res.send({
                msg: "Finance and membership doc not created!",
                success: false,
              });
            }
          }
          membershipData.membership_status = "Active";
          memberShipDoc = await createMemberShipDocument(
            membershipData,
            studentId
          );
          return res.send(memberShipDoc);
        } else {
          res.send({
            msg: "payment mode should be cash/cheque or credit card",
            success: false,
          });
        }
      } else {
        res.send({
          msg: "payment type should be weekly/monthly",
          success: false,
        });
      }
    } else {
      if (
        !membershipData.isEMI &&
        membershipData.balance == 0
        // && membershipData.payment_type == 'pif'
      ) {
        membershipData.due_status = "paid";
        membershipData.membership_status = "Active";
        if (stripePayload && ptype === "credit card") {
          console.log("payment method entered")
          var cli = await require("stripe")(stripe_sec);
          let cardId
          let findExistingCard = await StripeCards.findOne({ "card_number": stripePayload.card_number })
          console.log(findExistingCard)
          if (findExistingCard) {
            cardId = findExistingCard["card_id"]
          }
          else {
            if(!cli){
              return res.send({msg:"please add stipe Keys!", success:false})
            }
            let createdCard = await createCard({
              "body": {
                "card_number": stripePayload.card_number,
                "card_expiry_month": stripePayload.card_expiry_month,
                "card_expiry_year": stripePayload.card_expiry_year,
                "card_cvc": stripePayload.card_cvc,
                "email": stripePayload.email,
                "phone": stripePayload.phone,
              }
            },cli)
            console.log(createdCard)
            if (createdCard.status) {
              return createdCard
            }
            cardId = createdCard["id"]
          }
          let createPaymentResponse =  createPayment({
            "body": {
              "amount": stripePayload.amount,
              "card_id": cardId,
              "description": stripePayload.description,
              "email": stripePayload.email
            }
          }, cli)
          res.send(createPaymentResponse)
        } else if (ptype === ("cash" || "cheque")) {
          if (!financeId) {
            valorPayload.address = Address;
            valorPayload.userId = userId;
            valorPayload.studentId = studentId;
            const financeDoc = await createFinanceDoc(valorPayload);
            if (financeDoc.success) {
              memberShipDoc = await createMemberShipDocument(
                membershipData,
                studentId
              );
              return res.send(memberShipDoc);
            } else {
              res.send({
                msg: "Finace and membership doc not created!",
                success: false,
              });
            }
          }

          memberShipDoc = await createMemberShipDocument(
            membershipData,
            studentId
          );
          return res.send(memberShipDoc);
        }
      } else {
        res.send({
          msg: "payment type should be Pif or Monthly/Weekly",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log("entered here")
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
      billing_customer_name: payload.card_holder_name,
      billing_street_no: address.street_no,
      billing_street_name: address.address,
      billing_zip: address.zip,
    };
    return {
      ...payload,
      ...subscriptionAddress,
    };
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
          $set: {
            status: "Active",
            membership_expiry: data.expiry_date,
            membership_start: data.mactive_date,
          },
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
                      data: data._id,
                      msg: "membership purchase successfully",
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

function createFinanceDoc(data) {
  const { studentId } = data;
  return new Promise((resolve, reject) => {
    const financeData = new Finance_infoSchema(data);

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
    // }
  });
}


exports.checkData=async (req,res)=>{
  let userId=req.params.userId;
  const expired_LastaMembership = await AddMember.aggregate([
    {
      $match:{
        userId:userId
      }
    },
    {
      $project: {
        last_membership: {
          $arrayElemAt: ["$membership_details", -1],
        },  
        status:1,
      },
    },
    {
      $match: {
        status: { $nin: ["Expired"] },
        last_membership: {
          $nin: [null],
        },
      },
    },
    // {
    //   $lookup: {
    //     from: "buy_memberships",
    //     localField: "last_membership",
    //     foreignField: "_id",
    //     as: "membership",
    //     pipeline: [
    //       {
    //         $project: {
    //           expiry_date: {
    //             // $toDate: "$expiry_date",ghfjhgfgh
    //             $convert: {
    //               input: "$expiry_date",
    //               to: "date",
    //               onError: "$expiry_date",
    //               onNull: "$expiry_date",
    //             },
    //           },
    //           membership_status: 1,
    //         },
    //       },
          // {jkghgjh
          //   $match: {
          //     membership_status: {
          //       $ne: ["Expired"],
          //     },
          //   },
          // },jhbjbhbh
    //     ],
    //   },
    // },
    // {
    //   $unwind: "$membership",
    // },
   
    // {
    //   $match: {
    //     "membership.expiry_date": {
    //       $lte: new Date(),
    //     },
    //   },
    // },
    // {
    //   $project: {
    //     membershipId: "$membership._id",
    //   },
    // },
  ]);
  console.log(expired_LastaMembership)
}

function update_LastMembershipStatus(member) {
  let { _id, membershipId } = member;
  return new Promise((resolve, reject) => {
    AddMember.updateOne({ _id: _id.toString() }, { $set: { status: "Expired" } })
      .then((resp) => {
        buyMembership
          .updateOne(
            { _id: membershipId.toString() },
            { $set: { membership_status: "Expired" } }
          )
          .then((resp) => resolve(resp))
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
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
  // let studentInfo = await AddMember.findById(studentId);
  currentDate = moment().format("YYYY-MM-DD");
  try {
    let membershipDa = await buyMembership.find({
      studentInfo: { $in: studentId },
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

exports.getMergeDoc = async (req, res) => {
  await buyMembership
    .findOne({ _id: req.params.buyMembershipId })
    .then((data) => {
      res.send({ msg: "get merged doc", success: true, data: data.mergedDoc });
    })
    .catch((err) => {
      res.send({ msg: "data not found", success: false });
    });
};

exports.expiredMembership = async (req, res) => {
  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  const userId = req.params.userId;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  const studentType = req.query.studentType;
  const filter =
    userId && studentType
      ? {
        userId,
        studentType,
      }
      : {
        userId,
      };

  AddMember.aggregate([
    { $match: filter },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        program: 1,
        primaryPhone: 1,
        studentType: 1,
        last_attended_date: 1,
        memberprofileImage: 1,
        status: 1,
        followup_notes: 1,
        userId: 1,
        primaryPhone: 1,
        street: 1,
        town: 1,
        state: 1,
        zipPostalCode: 1,
        email: 1,
        last_membership: {
          $arrayElemAt: ["$membership_details", -1],
        },
      },
    },
    {
      $match: {
        last_membership: {
          $nin: [null],
        },
      },
    },
    {
      $lookup: {
        from: "buy_memberships",
        localField: "last_membership",
        foreignField: "_id",
        as: "memberships",
        pipeline: [
          {
            $project: {
              expiry_date: {
                $toDate: "$expiry_date",
              },
              membership_status: 1,
              membership_name: 1,
              membership_type: 1,
            },
          },
          // {
          //   $match: {
          //     membership_status: {
          //       $ne: ["Expired"],
          //     },
          //   },
          // },
        ],
      },
    },
    {
      $match: {
        "memberships.expiry_date": {
          $lte: new Date(),
        },
      },
    },
    {
      $lookup: {
        from: "followupnotes",
        localField: "followup_notes",
        foreignField: "_id",
        as: "followup_notes",
        pipeline: [
          {
            $project: {
              time: 1,
              note: 1,
              date: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        program: 1,
        notes: 1,
        primaryPhone: 1,
        studentType: 1,
        last_attended_date: 1,
        memberprofileImage: 1,
        status: 1,
        primaryPhone: 1,
        street: 1,
        town: 1,
        state: 1,
        zipPostalCode: 1,
        email: 1,
        notes: {
          $arrayElemAt: ["$followup_notes", -1],
        },
        memberships: 1,
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
  ]).exec((err, memberdata) => {
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
exports.createMemberShipDocument = createMemberShipDocument;
