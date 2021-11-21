const mongoose = require("mongoose");
let schema = mongoose.Schema;

const paidmembershipSchema = new schema(
  {
    due_status: {
      type: String,
      default: "due",
      enum: ["paid", "due", "over_due"],
    },
    isForfeit: {
      type: Boolean,
      default: false,
    },
    isTerminate: {
      type: Boolean,
      default: false,
    },
    refund_amount: {
      type: Number,
      default:""
    },
    isRefund: {
      type: Boolean,
      default: false,
    },
    membership_duration: {
      type: String,
    },
    // #(number of month / week / year)}

    program_name: {
      type: String,
    },
    // (monthly / weekly),
    total_amount: {
      type: Number,
      required: true,
    },
    down_payment: {
      type: Number,
    },
    // (based on(total_amount - down_payment) / number of(month / week))
    active_date: {
      type: String,
      required: true,
    },
    membership_status: {
      type: String,
      default: "Inactive",
      // (active / expired / freeze)
    },
    emi_type: {
      type: String,
    },
    emi_record: {
      type: Array,
      // [{ created_at, amount, created_by }, { created_at, amount, created_by }]
    },
    emi_dueDate: {
      type: Number,
    },
    number_of_emi: {
      type: Number,
    },
    created_by: {
      type: String,
    },
    studentId: {
      type: String,
    },
    paymentType: {
      type: String,
    },
    // ObjectID
    userId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("purchaseMembership", paidmembershipSchema);
