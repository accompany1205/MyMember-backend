'use strict';
const StripeCustomers = require('../models/stripe_customers')
const StripeCards = require('../models/stripe_cards')
const StoreTransaction = require('../models/store_transactions')
const uuid = require('uuid').v4
const Config = require("../config/stripe")
const stripe = require("stripe")(Config["secretKey"])
const _ = require('lodash')

exports.createCustomer = async (req, res, next) => {
    let customerData = req.body
    try {
        let customer = await stripe.customers.create({
            email: customerData.email,
            metadata: {
                account_id: customerData.account_id,
            }
        });
        customerData.customer_id = customer.id
        let dataObj = {
            "id":customerData.customer_id,
            "email":customerData.email,
            "account_id":customerData.account_id,
            "name":customerData.name
        }
        let findCustomer = await StripeCustomers.findOne({"email":customerData.email})
        console.log(findCustomer)
        if(findCustomer)
        {
            throw {"status":false,"message":"customer already existed"}
        }
        //Create a new customer in DB           
        let customerObj = await StripeCustomers.create(dataObj)
        
        res.send(customerObj)

    } catch (error) {
        console.log("Error--->", error)
        res.send(error)
    }  
};

exports.createCard = async (req, res) => {
    try {
        let cardNumber = req.body.card_number
        let cardExpiryMonth = req.body.card_expiry_month
        let cardExpiryYear = req.body.card_expiry_year
        let cardCvc = req.body.card_cvc
        let email = req.body.email
        let cardToken = await createCardToken({ cardNumber, cardExpiryMonth, cardExpiryYear, cardCvc })
        let findCustomer = await StripeCustomers.findOne({ "email": email })
        let customerId
        let cardCheck = await StripeCards.findOne({ "card_number": cardNumber,"email":email })
        if (cardCheck) {
            throw ({ "status": false, "message": "card already existed with this customer email" })
        }
        if (findCustomer == null) {
            throw { "status": false, "message": "customer not existed" }
        }
        else {
            customerId = findCustomer.id
        }
        let cardId = await stripe.customers.createSource(
            customerId,
            { source: cardToken.id }
        );
        let storeCard = StripeCards.create(
            {
                "customer_id": customerId,
                "card_id": cardId.id,
                "card_number": cardNumber,
                "email": email
            }
        )
        res.send(cardId)
    }
    catch (error) {
        console.log(JSON.parse(JSON.stringify(error)))
        res.send(error)
    }
};

let createCardToken = async (body, res) => {
    let cardNumber = body.cardNumber
    let cardExpiryMonth = body.cardExpiryMonth
    let cardExpiryYear = body.cardExpiryYear
    let cardCvc = body.cardCvc

    let cardToken = await stripe.tokens.create({
        card: {
            number: cardNumber,
            exp_month: cardExpiryMonth,
            exp_year: cardExpiryYear,
            cvc: cardCvc,
        },
    });
    return cardToken
};

exports.listCustomers = async (req, res) => {
    let findObject = {}
    if(req.body.email)
    {
        findObject.email = req.body.email
    }
    if(req.body.account_id)
    {
        findObject.account_id = req.body.account_id
    }
    let customersList = await StripeCustomers.find(findObject);
    res.send(customersList)
};

exports.confirmPayment = async (req, res) => {
    try {
        let paymentId = req.body.payment_id
        let payment_method = req.body.card_id
        let paymentIntentConfirmation = await stripe.paymentIntents.confirm(
            paymentId, {
            "payment_method": payment_method,
        }
        );
        res.send(paymentIntentConfirmation)
    }
    catch (error) {
        res.send({
            "status": false,
            "error_obj": error,
            "Messsage": "Something went wrong while confirm payment"
        })
    }
}

exports.listCards = async (req, res) => {
    let findObject = {}
    if(req.body.email)
    {
        findObject.email = req.body.email
    }
    if(req.body.card_id)
    {
        findObject.card_id = req.body.card_id
    }
    if(req.body.customer_id)
    {
        findObject.customer_id = req.body.customer_id
    }
    let cardsList = await StripeCards.find(findObject);
    res.send(cardsList)
};

exports.createPayment = async (req, res) => {
    try {
        let findCustomer = await StripeCustomers.findOne({ "email": req.body.email })
        if (findCustomer == null) {
            throw { "status": false, "message": "customer not existed" }
        }
        let paymentIntent = await stripe.paymentIntents.create({
            amount: (req.body.amount) * 100, //stripe uses cents
            currency: 'inr',
            customer: findCustomer.get("id"),
            payment_method_types: ['card'],
            payment_method: req.body.card_id,
            confirm: "true",
            description: req.body.description
        });
        let storeTransaction = await StoreTransaction.create(paymentIntent)
        res.send(paymentIntent)
    }
    catch (err) {
        res.send(err)
    }
};


let createChargeId = async (body, res) => {
     /*
    This function is used to create a refund charge id in stripe 
    */
    try {
        let amount = body.amount
        let currency = body.currency
        let source = body.cardId
        let description = body.description
        let customer = body.customer

        let chargeId = await stripe.charges.create({
            amount: amount,
            currency: currency,
            customer: customer,
            source: source,
            description: description,
        });

        console.log("---------------------", chargeId)
        return chargeId
    }
    catch (error) {
        return error
    }
};


exports.createRefund = async (req, res) => {
    /*
    This Api is used to create a refund charge id in stripe and create refund to selected account
    */
    try {
        let findCustomer = await StripeCustomers.findOne({ "email": req.body.email })
        if (findCustomer == null) {
            throw { "status": false, "message": "customer not existed" }
        }
        let createChargeIdResponse = await createChargeId({
            amount: (req.body.amount) * 100, //stripe uses cents
            currency: 'inr',
            customer: findCustomer.get("id"),
            source: req.body.card_id,
            description: req.body.description
        })
        let refund = await stripe.refunds.create({
          charge: createChargeIdResponse["id"],
        });
        let storeTransaction = await StoreTransaction.create(refund)
        res.send(refund)
    }
    catch (err) {
        res.send({ "status": false, "message": err })
    }
};

