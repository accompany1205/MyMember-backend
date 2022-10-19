const mongoose = require("mongoose");
const schema = mongoose.Schema;

const stripe_customers_schema = new schema(
  {
    id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("stripe_customers", stripe_customers_schema);
