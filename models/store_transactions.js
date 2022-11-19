const mongoose = require("mongoose");
const schema = mongoose.Schema;

const store_transactions_schema = new schema(
  {
    id: {
      type: String,
    },
    studentId: {
      type: String,
    },
    userId: {
      type: String,
    },
    object: {
      type: String,
    },
    amount: {
      type: String,
    },
    status: {
      type: String,
    },
    currency: {
      type: String,
    },
    card_number: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "store_transactions",
  store_transactions_schema
);
