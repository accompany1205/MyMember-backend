const express = require("express");
const router = express.Router();
const finance_invoice = require("../controllers/finance_invoice");
const { requireSignin, isAuth } = require("../controllers/auth");
const { getInvoices, createInvoice, deleteInvoice } = finance_invoice;

router.get("/finance/finance_invoice/:userId", requireSignin, getInvoices);
router.post("/finance/finance_invoice/:userId", requireSignin, createInvoice);

module.exports = router;
