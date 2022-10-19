const express = require("express");
const router = express.Router();
const { createCustomer, listCustomers, createCard, listCards, createPayment, createRefund, confirmPayment, createStudents, stripePayment, stripePaymentsPlans, stripePaymentSubscriptions, RecurringPayment } = require("../Services/stripe");
const { verifySchool } = require("../controllers/auth");


router.post("/create_customer/:userId", createCustomer);
router.get("/create_student/:student", createStudents)
router.get("/list_customers", listCustomers);
// router.post("/create_card_token", createCardToken);
router.post("/create_card", createCard);
router.get("/list_cards", listCards);
// router.post("/create_payment", createPayment);
router.post("/create_refund", createRefund);
router.post("/confirm_payment", confirmPayment);
router.post("/stripePayment", stripePayment)
router.post("/stripePaymentSubscriptions", stripePaymentSubscriptions)
router.post("/RecurringPayment", RecurringPayment)


router.post("/stripePaymentsPlan", stripePaymentsPlans)

module.exports = router;