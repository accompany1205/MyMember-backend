"use strict";
const StripeCustomers = require("../models/stripe_customers");
const buyMembership = require("../models/buy_membership");
const Members = require("../models/addmember");
const User = require("../models/user");
const StripeCards = require("../models/stripe_cards");
const schedulePayment = require("../models/schedulePayment");
const StoreTransaction = require("../models/store_transactions");
const uuid = require("uuid").v4;
const Config = require("../config/stripe");
const stripe = require("stripe")(Config["secretKey"]);
const _ = require("lodash");

const createStudents = async (req, res) => {
  const id = req.params.student;
  try {
    const data = await Members.find({ userId: id });
    let customerObj;
    let promise = [];
    for (let studentData of data) {
      let customer = await stripe.customers.create({
        email: studentData.email,
        metadata: {
          account_id: "frank",
        },
      });
      studentData.customer_id = customer.id;
      let dataObj = {
        id: studentData.customer_id,
        email: studentData.email,
        account_id: "frank",
        name: studentData.firstName,
      };
      console.log(dataObj);
      if (dataObj.email) {
        let findCustomer = await StripeCustomers.findOne({
          email: studentData.email,
        });
        console.log(findCustomer);
        if (findCustomer) {
          // throw { "status": false, "message": "customer already existed" }
          console.log(findCustomer);
        } else {
          customerObj = await StripeCustomers.create(dataObj);
          promise.push(customerObj);
        }
      }
    }
    await Promise.all(promise);
    return res.send(promise);
  } catch (error) {
    res.send(error);
  }
};

const createCustomer = async (req, res, next) => {
  let customerData = req.body;
  let userId = req.params.userId;
  try {
    let { stripe_sec } = await User.findOne({ _id: userId });
    // var cli = await require("stripe")(stripe_sec);
    let customer = await stripe.customers.create({
      email: customerData.email,
      metadata: {
        account_id: customerData.account_id,
      },
    });
    customerData.customer_id = customer.id;
    let dataObj = {
      id: customerData.customer_id,
      email: customerData.email,
      account_id: customerData.account_id,
      name: customerData.name,
    };
    let findCustomer = await StripeCustomers.findOne({
      email: customerData.email,
    });
    console.log(findCustomer);
    if (findCustomer) {
      throw { status: false, message: "customer already existed" };
    }
    //Create a new customer in DB
    let customerObj = await StripeCustomers.create(dataObj);

    res.send(customerObj);
  } catch (error) {
    console.log("Error--->", error);
    res.send(error);
  }
};

let createCardToken = async (body, res) => {
  let cardNumber = body.cardNumber;
  let cardExpiryMonth = body.cardExpiryMonth;
  let cardExpiryYear = body.cardExpiryYear;
  let cardCvc = body.cardCvc;

  let cardToken = await stripe.tokens.create({
    card: {
      number: cardNumber,
      exp_month: cardExpiryMonth,
      exp_year: cardExpiryYear,
      cvc: cardCvc,
    },
  });
  return cardToken;
};

const listCustomers = async (req, res) => {
  let findObject = {};
  if (req.body.email) {
    findObject.email = req.body.email;
  }
  if (req.body.account_id) {
    findObject.account_id = req.body.account_id;
  }
  let customersList = await StripeCustomers.find(findObject);
  res.send(customersList);
};

const confirmPayment = async (req, res) => {
  try {
    let paymentId = req.body.payment_id;
    let payment_method = req.body.card_id;
    let paymentIntentConfirmation = await stripe.paymentIntents.confirm(
      paymentId,
      {
        payment_method: payment_method,
      }
    );
    res.send(paymentIntentConfirmation);
  } catch (error) {
    res.send({
      status: false,
      error_obj: error,
      Messsage: "Something went wrong while confirm payment",
    });
  }
};

const createCard = async (req, stripe) => {
  try {
    let cardNumber = req.body.card_number;
    let cardExpiryMonth = req.body.card_expiry_month;
    let cardExpiryYear = req.body.card_expiry_year;
    let cardCvc = req.body.card_cvc;
    let card_holder_name = req.body.card_holder_name;
    let email = req.body.email;
    let phone = req.body.phone;
    let address = req.body.address;
    let userId = req.body.userId;
    let studentId = req.body.studentId;
    let cardToken = await createCardToken(
      { cardNumber, cardExpiryMonth, cardExpiryYear, cardCvc },
      stripe
    );

    let findCustomer = await StripeCustomers.findOne({
      email: email,
      studentId: studentId,
    });
    let customerId;
    let cardCheck = await StripeCards.findOne({
      card_number: cardNumber,
      email: email,
      studentId: studentId,
    });
    if (cardCheck) {
      return {
        id: cardCheck["card_id"],
        success: true,
        message: "card already existed with this customer email",
      };
    }
    if (findCustomer == null) {
      // if customer is not exist in stripe and our db
      let customer = await stripe.customers.create({
        email: email,
        name: card_holder_name,
        metadata: {
          userId: userId,
          studentId: studentId,
        },
      });
      customerId = customer.id;
      let dataObj = {
        id: customerId,
        email: email,
        studentId: studentId,
        userId: userId,
        name: card_holder_name ? card_holder_name : "",
      };
      await StripeCustomers.create(dataObj);
    } else {
      customerId = findCustomer.id;
    }
    // add payment method for stripe customer for future use
    let paymentMethod = await stripe.customers.createSource(customerId, {
      source: cardToken.id,
    });
    let storeCard = StripeCards.create({
      studentId: studentId,
      userId: userId,
      customer_id: customerId,
      card_id: paymentMethod.id,
      brand: paymentMethod.brand,
      exp_month: paymentMethod.exp_month,
      exp_year: paymentMethod.exp_year,
      last4: paymentMethod.last4,
      card_number: cardNumber,
      email: email,
      phone: phone,
      address,
      card_holder_name,
    });

    return paymentMethod;
  } catch (error) {
    return error;
  }
};

const addStripePaymentMethod = async (req, res) => {
  try {
    const { studentId, userId } = req.params;
    const stripePayload = req.body;
    const { stripe_sec } = await User.findOne({ _id: userId });
    const stripeObj = await require("stripe")(stripe_sec);
    let findExistingCard = await StripeCards.findOne({
      card_number: stripePayload.card_number,
      studentId: studentId,
    });
    if (findExistingCard) {
      // if card already exist with same card number
      res.send({ status: false, msg: "Card detail already exist!" });
    } else {
      //if card is not exist then create a card and save it for future use
      if (!stripeObj) {
        return res.send({
          msg: "please add stipe Keys!",
          success: false,
        });
      }
      let createdCard = await createCard(
        {
          body: {
            card_number: stripePayload.card_number,
            card_holder_name: stripePayload.card_holder_name,
            card_expiry_month: stripePayload.expiry_month,
            card_expiry_year: stripePayload.expiry_year,
            card_cvc: stripePayload.cvv,
            email: stripePayload?.email ? stripePayload?.email : "",
            phone: stripePayload?.phone ? stripePayload?.phone : "",
            address: stripePayload?.address ? stripePayload?.address : "",
            userId: userId,
            studentId: studentId,
          },
        },
        stripeObj
      );

      if (createdCard["id"]) {
        const cardsList = await StripeCards.find({ studentId: studentId });
        res.send({
          msg: "finance Info added successfully",
          success: true,
          data: cardsList,
        });
      } else {
        return res.send({
          msg: createdCard?.raw?.message
            ? createdCard?.raw?.message
            : "finance info is not added",
          success: false,
        });
      }
    }
  } catch (e) {
    res.send({ success: false, msg: e.message });
  }
};

const listCards = async (req, res) => {
  const studentId = req.params.studentId;
  const cardsList = await StripeCards.find({ studentId: studentId });
  res.send(cardsList);
};

// const chargeEmiWithStripeCron = async (req, res) => {
//   const todayDate = moment().format("yyyy-MM-DD");
//   console.log(todayDate, "todayDate");
//   await schedulePayment.find(
//     {
//       date: todayDate,
//       status: "due",
//       ptype: "credit card",
//     },
//     (error, dueEmiData) => {
//       if (error) {
//         res.send({ msg: "Data is not found!", success: false, error: error });
//       } else {
//         console.log(dueEmiData, "dueEmiData");
//         Promise.all(
//           dueEmiData?.map(async (dueEmiObj) => {
//             const studentId = dueEmiObj.studentId;
//             const userId = dueEmiObj.userId;
//             const amount = dueEmiObj.Amount;
//             const Id = dueEmiObj.Id;
//             const purchased_membership_id = dueEmiObj.purchased_membership_id;
//             const { stripe_sec } = await User.findOne({ _id: userId });
//             const stripeObj = await require("stripe")(stripe_sec);
//             // fetch stripe cards detail
//             let stripeDetails = {};
//             stripeDetails = await StripeCards?.findOne({
//               studentId: studentId,
//               isDefault: true,
//             });
//             if (stripeDetails === null) {
//               stripeDetails = await StripeCards?.findOne({
//                 studentId: studentId,
//               });
//             }
//             const card_id = stripeDetails.card_id;
//             const customer_id = stripeDetails.customer_id;
//             const createdBy = stripeDetails.card_holder_name;

//             const paymentObj = {
//               amount: amount * 100, //stripe uses cents
//               currency: "usd",
//               customer: customer_id,
//               payment_method_types: ["card"],
//               payment_method: card_id,
//               confirm: "true",
//               description: "Monthly Emi installment",
//             };
//             const paymentIntent = await stripeObj.paymentIntents.create(
//               paymentObj
//             );
//             await StoreTransaction.create({
//               ...paymentIntent,
//               studentId,
//               userId,
//               purchased_membership_id,
//               emiId: Id,
//             });
//             if (
//               paymentIntent?.statusCode === "200" ||
//               paymentIntent?.status === "succeeded"
//             ) {
//               // update payment status
//               await schedulePayment.updateOne(
//                 { studentId: studentId.toString(), Id: Id },
//                 { $set: { status: "paid", paymentIntentId: paymentIntent.id } }
//               );
//               /*  ======================*/
//               await buyMembership.updateOne(
//                 {
//                   _id: purchased_membership_id,
//                   "schedulePayments.Id": Id,
//                 },
//                 {
//                   $set: {
//                     membership_status: "Active",
//                     "schedulePayments.$.status": "paid",
//                     "schedulePayments.$.ptype": "credit card",
//                     "schedulePayments.$.paymentIntentId": paymentIntent.id,
//                     "schedulePayments.$.createdBy": createdBy,
//                     "schedulePayments.$.paidDate": new Date(),
//                   },
//                 },
//                 (err, data) => {
//                   if (err) {
//                     console.log(err, "err");
//                   } else {
//                     console.log(data, "success");
//                   }
//                 }
//               );
//               /*======================*/
//             }

//             return {
//               studentId,
//               userId,
//               purchased_membership_id,
//               emiId: Id,
//               paymentIntent,
//             };
//           })
//         )
//           .then((resdata) => {
//             res.send({
//               msg: "Emi payment completed!",
//               data: resdata,
//               success: true,
//             });
//           })
//           .catch((error) => {
//             res.send({
//               msg: "Emi payment failed",
//               success: false,
//               error: error,
//             });
//           });
//       }
//     }
//   );
// };

const setDefaultPaymentMethod = async (req, res) => {
  const studentId = req.params.studentId;
  const card_id = req.params.card_id;
  if (!card_id && !studentId) {
    res.send({ success: false, error: "cardId or studentId is required!" });
  } else {
    const updateFalse = {
      $set: {
        isDefault: false,
      },
    };
    const updateTrue = {
      $set: {
        isDefault: true,
      },
    };

    StripeCards.updateMany(
      {
        studentId: studentId,
      },
      updateFalse
    )
      .then((data) => {
        StripeCards.updateMany(
          {
            studentId: studentId,
            card_id: card_id,
          },
          updateTrue
        )
          .then(async (data) => {
            const cardsList = await StripeCards.find({ studentId: studentId });
            res.send({
              success: true,
              msg: "Payment method updated to default!",
              data: cardsList,
            });
          })
          .catch((err) =>
            res.send({
              error: "something went wrong! Try again",
              success: false,
            })
          );
      })
      .catch((err) =>
        res.send({ error: "Something went wrong!", success: false })
      );
  }
};

const deletePaymentMethod = async (req, res) => {
  const studentId = req.params.studentId;
  const card_id = req.body.card_id;
  const customer_id = req.body.customer_id;
  try {
    const deleted = await stripe.customers.deleteSource(customer_id, card_id);

    const deleteobj = await StripeCards.deleteOne({
      studentId: studentId,
      card_id: card_id,
    });
    const cardsList = await StripeCards.find({ studentId: studentId });
    res.send({
      success: true,
      msg: "Payment method deleted!",
      data: cardsList,
    });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};
const createPayment = async (req, res) => {
  try {
    let findCustomer = await StripeCustomers.findOne({ email: req.body.email });
    if (findCustomer == null) {
      throw { status: false, message: "customer not existed" };
    }
    console.log("amount is ------------", req.body.amount, req.body.card_id);
    let paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount * 100, //stripe uses cents
      currency: "usd",
      customer: findCustomer.get("id"),
      payment_method_types: ["card"],
      payment_method: req.body.card_id,
      confirm: "true",
      description: req.body.description,
    });
    let storeTransaction = await StoreTransaction.create(paymentIntent);
    return paymentIntent;
  } catch (err) {
    return err;
  }
};

let createChargeId = async (body, res) => {
  /*
   This function is used to create a refund charge id in stripe 
   */
  try {
    let amount = body.amount;
    let currency = body.currency;
    let source = body.cardId;
    let description = body.description;
    let customer = body.customer;

    let chargeId = await stripe.charges.create({
      amount: amount,
      currency: currency,
      customer: customer,
      source: source,
      description: description,
    });

    console.log("---------------------", chargeId);
    return chargeId;
  } catch (error) {
    return error;
  }
};

const createRefund = async (req, res) => {
  /*
    This Api is used to create a refund charge id in stripe and create refund to selected account
    */
  try {
    let findCustomer = await StripeCustomers.findOne({ email: req.body.email });
    if (findCustomer == null) {
      throw { status: false, message: "customer not existed" };
    }
    let createChargeIdResponse = await createChargeId({
      amount: req.body.amount * 100, //stripe uses cents
      currency: "usd",
      customer: findCustomer.get("id"),
      source: req.body.card_id,
      description: req.body.description,
    });
    let refund = await stripe.refunds.create({
      charge: createChargeIdResponse["id"],
    });
    let storeTransaction = await StoreTransaction.create(refund);
    res.send(refund);
  } catch (err) {
    res.send({ status: false, message: err });
  }
};

module.exports = {
  // chargeEmiWithStripeCron,
  addStripePaymentMethod,
  createCard,
  confirmPayment,
  listCustomers,
  createCustomer,
  createStudents,
  listCards,
  createRefund,
  createPayment,
  deletePaymentMethod,
  setDefaultPaymentMethod,
};
