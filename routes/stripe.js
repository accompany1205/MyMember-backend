const express = require("express");
const router = express.Router();
const {
  createCustomer,
  listCustomers,
  createCard,
  listCards,
  addStripePaymentMethod,
  createStudents,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  // chargeEmiWithStripeCron,
} = require("../Services/stripe");
const { verifySchool } = require("../controllers/auth");

router.post("/create_customer/:userId", createCustomer);
router.get("/create_student/:student", createStudents);
router.get("/list_customers", listCustomers);
// router.get("/charge_emi_withstripe", chargeEmiWithStripeCron);
// router.post("/create_card_token", createCardToken);
router.post("/create_card", createCard);

router.post(
  "/add_stripe_payment_method/:userId/:studentId",
  addStripePaymentMethod
);
router.post("/list_cards/:studentId", listCards);

router.post(
  "/set_default_paymentMethod/:studentId/:card_id",
  setDefaultPaymentMethod
);
router.post("/delete_paymentMethod/:studentId", deletePaymentMethod);

module.exports = router;
