const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Membershipschema = new schema(
  {
    Id: {
      type: String,
      default: false,
    },

    Amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      requred: true,
    },
    ptype: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    createdBy: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    purchased_membership_id: {
      type: String,
      required: true,
      index: true,
    },
    paymentIntentId: {
      type: String,
    },
    isRefund: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("schedulePayment", Membershipschema);
