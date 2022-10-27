'use strict';
const StripeCustomers = require('../models/stripe_customers')
const Members = require("../models/addmember")
const User = require("../models/user");
const StripeCards = require('../models/stripe_cards')
const StoreTransaction = require('../models/store_transactions')
const uuid = require('uuid').v4
const Config = require("../config/stripe")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const _ = require('lodash');
const email_system_Category = require('../models/email_system_Category');
const MyWalletModal = require('../models/Mywallet')
exports.stripePaymentsPlans = async (req, res) => {
    const token = await stripe.tokens.create({
        card: {
            number: '4242424242424242',
            exp_month: 10,
            exp_year: 2023,
            cvc: '314',
        },
    });
    console.log('token', token.id)
    try {
        stripe.customers
            .create({
                name: "Mujahid",
                email: "mujahid122418@gmail.com",
                source: token.id
            })
            .then(customer => {
                console.log('customer', customer);
                stripe.subscriptions.create({
                    customer: customer.id,
                    items: [
                        { price: 'price_1LqwdbHDL8mWxP3ea7y5OG5F' },
                    ],
                })
            }
            )
            .then(() => res.status(200).json({ success: true, message: "Payment Successful", }))
            .catch(err => res.status(400).json({
                success: false,
                message: "Payment Failed"

            }));
        // const subscription = await stripe.subscriptions.create({
        //     customer: 'cus_Ma6ueKUNbqQWHo',
        //     items: [
        //       {price: 'price_1LqwdbHDL8mWxP3ea7y5OG5F'},
        //     ],
        //   });
        //   console.log('subscription',  subscription)
    } catch (e) {
        console.log("eee", e)
    }
}

exports.stripePayment = async (req, res) => {
    let { email, payment_method, cvc, cardNum, exp_year, exp_month, amount } = req.body
    console.log('body payment', amount)


    try {
        const token = await stripe.tokens.create({
            card: {
                number: cardNum,
                exp_month: exp_month,
                exp_year: exp_year,
                cvc: cvc,
            },
        });
        console.log('token', token.id)
        await stripe.customers
            .create({
                name: email,
                email: email,
                source: token.id
            })
            .then(customer => {
                console.log("customer ", customer);
                stripe.charges.create({
                    amount: +amount * 100,
                    currency: "usd",
                    customer: customer.id
                })
            }
            )
            .then(() => res.status(200).json({ success: true, message: "Payment Successful", }))
            .catch(err => res.status(400).json({
                success: false,
                message: "Payment Failed"

            }));

    } catch (err) {
        console.log('err', err)
        res.status(400).json({
            success: false,
            message: "Payment Failed"

        })
    }
}
const UpdateUserInfo = async (user_id, cus_id, sub_id) => {
    // console.log('work', user_id, cus_id)
    let bData = {
        customer_id: cus_id,
        sub_id: sub_id
    }
    let UserInfo = await User.findByIdAndUpdate(user_id, bData, {
        new: true,
        runValidators: true
    })
    console.log("updated")
    // res.status(200).json({
    //     success: true,
    //     data: UserInfo,
    // })
}
exports.RecurringPayment = async (req, res) => {
    try {
        // console.log("RecurringPayment", req.body)
        let sub_id = req.body.data.object.id;
        let user = await User.find({ sub_id: sub_id })
        console.log("req body user", user[0]._id)
        const doesUserExist = await MyWalletModal.findOne({ user_id: user[0]._id });
        console.log("doesUserExist._id", doesUserExist._id)
        if (doesUserExist) {
            let creditsInfo = await MyWalletModal.findByIdAndUpdate(doesUserExist._id, {
                $inc: {
                    cretits: 300
                }
            }, {
                new: true,
                runValidators: true
            })
            console.log('data update')
            // res.status(200).json({
            //     success: true,
            //     data: creditsInfo
            // })
        }
        // console.log("res" , res)
    } catch (e) {
        console.log("e recurring", e)
    }
}
exports.stripePaymentSubscriptions = async (req, res) => {
    let { email, payment_method, cvc, cardNum, exp_year, exp_month, amount, userId, customer_id } = req.body
    let user = await User.findOne({ _id: userId });
    try {

        // create token
        const token = await stripe.tokens.create({
            card: {
                number: cardNum,
                exp_month: exp_month,
                exp_year: exp_year,
                cvc: cvc,
            },
        });
        console.log('token', token.id)
        // create customer
        let customer = await stripe.customers
            .create({
                name: email,
                email: email,
                source: token.id
            })
        console.log('customer', customer.id)
        const product = await stripe.products.create({
            name: 'Gold Special',
        });
        console.log('product', product.id)

        const price = await stripe.prices.create({
            unit_amount: 2500,
            currency: 'usd',
            recurring: { interval: 'month' },
            // product: 'prod_MdBpyqSYjJwz8b',
            product: product.id,
        });
        console.log('price', price.id)
        const subscription = await stripe.subscriptions.create({
            // customer: 'cus_MZQSpOn0dSItOX',
            customer: customer.id,
            items: [
                //   {price: 'price_1LtvSJEqCRWTYE4oBLRSccCJ'},
                { price: price.id },
            ],
        });
        console.log('subscription', subscription.id)
        UpdateUserInfo(userId, customer.id, subscription.id)
        res.status(200).json({ success: true, message: "Payment Successful" })
        // await stripe.customers
        //     .create({
        //         name: email,
        //         email: email,
        //         source: token.id
        //     })

        //     .then(customer => {
        //         UpdateUserInfo(userId, customer.id)
        //         stripe.charges.create({
        //             amount: +amount * 100,
        //             currency: "usd",
        //             customer: customer.id
        //         })
        //     }
        //     )
        //     .then(() => res.status(200).json({ success: true, message: "Payment Successful", }))
        //     .catch(err =>
        //         res.status(400).json({
        //             success: false,
        //             message: "Payment Failed"
        //         }));



    } catch (err) {
        console.log('err', err)
        res.status(400).json({
            success: false,
            message: "Payment Failed"
        })
    }
}

exports.createStudents = async (req, res) => {
    const id = req.params.student
    try {
        const data = await Members.find({ userId: id });
        console.log(data)
        let customerObj;
        let promise = [];
        for (let studentData of data) {
            let customer = await stripe.customers.create({
                email: studentData.email,
                metadata: {
                    account_id: "frank",
                }
            });
            studentData.customer_id = customer.id
            let dataObj = {
                "id": studentData.customer_id,
                "email": studentData.email,
                "account_id": "frank",
                "name": studentData.firstName
            }
            console.log(dataObj)
            if (dataObj.email) {
                let findCustomer = await StripeCustomers.findOne({ "email": studentData.email })
                console.log(findCustomer)
                if (findCustomer) {
                    // throw { "status": false, "message": "customer already existed" }
                    console.log(findCustomer);
                } else {
                    customerObj = await StripeCustomers.create(dataObj)
                    promise.push(customerObj);
                }

            }

        }
        await Promise.all(promise);
        return res.send(promise)
    } catch (error) {
        res.send(error)
    }

}

exports.createCustomer = async (req, res, next) => {
    let customerData = req.body
    let userId = req.params.userId;
    try {
        let { stripe_sec } = await User.findOne({ _id: userId });
        var cli = await require("stripe")(stripe_sec);
        let customer = await cli.customers.create({
            email: customerData.email,
            metadata: {
                account_id: customerData.account_id,
            }
        });
        customerData.customer_id = customer.id
        let dataObj = {
            "id": customerData.customer_id,
            "email": customerData.email,
            "account_id": customerData.account_id,
            "name": customerData.name
        }
        let findCustomer = await StripeCustomers.findOne({ "email": customerData.email })
        console.log(findCustomer)
        if (findCustomer) {
            throw { "status": false, "message": "customer already existed" }
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
        let phone = req.body.phone
        let cardToken = await createCardToken({ cardNumber, cardExpiryMonth, cardExpiryYear, cardCvc })
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
        let cardId = await stripe.customers.createSource(
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
    if (req.body.email) {
        findObject.email = req.body.email
    }
    if (req.body.account_id) {
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
    if (req.body.email) {
        findObject.email = req.body.email
    }
    if (req.body.card_id) {
        findObject.card_id = req.body.card_id
    }
    if (req.body.customer_id) {
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
        console.log("amount is ------------", req.body.amount, req.body.card_id,)
        let paymentIntent = await stripe.paymentIntents.create({
            amount: (req.body.amount) * 100, //stripe uses cents
            currency: 'usd',
            customer: findCustomer.get("id"),
            payment_method_types: ['card'],
            payment_method: req.body.card_id,
            confirm: "true",
            description: req.body.description
        });
        let storeTransaction = await StoreTransaction.create(paymentIntent)
        return paymentIntent
    }
    catch (err) {
        return err
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
            currency: 'usd',
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

