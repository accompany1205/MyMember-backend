const express = require("express");
const router = express.Router();
const finance_invoice = require("../controllers/finance_invoice");
const { requireSignin, isAuth } = require("../controllers/auth");
const { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } = finance_invoice;

router.get("/finance/finance_invoice/:userId", requireSignin, getInvoices);
router.get("/finance/finance_invoice/:userId/invoice/:invoiceId", requireSignin, getInvoiceById);
router.post("/finance/finance_invoice/:userId", requireSignin, createInvoice);
router.patch("/finance/finance_invoice/:userId/invoice/:invoiceId", requireSignin, updateInvoice);
router.delete("/finance/finance_invoice/:invoiceId", requireSignin, deleteInvoice);

module.exports = router;
