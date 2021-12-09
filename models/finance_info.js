const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Finance_infoSchema = new schema(
  {
    card_type: {
      type: String,
      required: true,
      enum: ["credit", "debit"],
      default: "credit",
    },
    uid: {
      type: Number,
      require: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    custom_fee: {
      type: Number,
    },
    tax: {
      type: Number,
    },
    cvv: {
      type: Number,
      require: true,
    },
    pan: {
      type: String,
      default: "",
    },
    expiry_date: {
      type: String,
      required: true,
    },
    card_holder_name: {
      type: String,
    },
    descriptor: {
      type: String,
    },
    invoice_no: {
      type: Number,
    },
    product_description: {
      type: String,
    },
    address: {},
    subscription_day_of_the_month: {
      type: Number,
    },
    subscription_starts_from: {
      type: String,
    },
    Subscription_valid_for: {
      type: Number,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    surchargeIndicator: {
      type: Number,
    },
    studentId: {
      type: String
    },
    userId: {
      type: String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FinanceInfo", Finance_infoSchema);
