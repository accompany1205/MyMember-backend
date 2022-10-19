const express = require("express");
const router = express.Router();
const {
  createCustomer,
  listCustomers,
  createCard,
  listCards,
  createPayment,
  createRefund,
  confirmPayment,
  createStudents,
} = require("../Services/stripe");
const { verifySchool } = require("../controllers/auth");

router.post("/create_customer/:userId", createCustomer);
router.get("/create_student/:student", createStudents);
router.get("/list_customers", listCustomers);
// router.post("/create_card_token", createCardToken);
router.post("/create_card", createCard);
router.post("/list_cards/:studentId", listCards);
// router.post("/create_payment", createPayment);
router.post("/create_refund", createRefund);
router.post("/confirm_payment", confirmPayment);
module.exports = router;
