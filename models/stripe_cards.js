const mongoose = require("mongoose");
const schema = mongoose.Schema;

const stripe_cards_schema = new schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    customer_id: {
      type: String,
      required: true,
      index: true,
    },
    card_id: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
    },
    exp_month: {
      type: String,
      required: true,
    },
    exp_year: {
      type: String,
      required: true,
    },
    last4: {
      type: String,
      required: true,
    },
    card_number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    card_holder_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model("stripe_cards", stripe_cards_schema);
