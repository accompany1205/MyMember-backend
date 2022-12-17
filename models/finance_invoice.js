const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Finance_invoiceSchema = new schema(
  {
    clientId: {
      type: String,
      index: true,
      required: true,
    },
    userId: {
      type: String,
      index: true,
    },
    project: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    invoice_date: {
      type: Date,
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
    },
    tags: {
      type: String,
    },
    notes: {
      type: String,
    },
    terms_and_conditions: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FinanceInvoice", Finance_invoiceSchema);
