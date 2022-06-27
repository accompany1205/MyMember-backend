const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Membershipschema = new schema(
  {
    isEMI: {
      type: Boolean,
      required: true,
    },
    due_status: {
      type: String,
      default: "due",
      enum: ["paid", "due", "over_due"],
    },
    isFreeze: {
      type: Boolean,
      default: false,
    },
    whenFreeze: {
      type: Array,
    },
    isForfeit: {
      type: Boolean,
      default: false,
    },
    whenForFeit: {
      type: Array,
    },
    isTerminate: {
      type: Boolean,
      default: false,
    },
    whenTerminate: {
      type: Array,
    },
    refund: {
      type: Array,
    },
    isRefund: {
      type: Boolean,
      default: false,
    },
    student_name: {
      type: String,
    },
    membership_name: {
      type: String,
      required: true,
    },
    membership_type: {
      type: String,
      required: true,
    },
    mactive_date: {
      type: String,
      required: true,
    },
    membership_duration: {
      type: String,
      required: true,
    },
    expiry_date: {
      type: String,
      required: true,
    },
    register_fees: {
      type: Number,
      required: true,
    },
    totalp: {
      type: Number,
      required: true,
    },
    start_payment_Date: {
      type: String,
      required: true,
    },
    schedulePayments: {
      type: Array,
      requred: true,
    },
    dpayment: {
      type: Number,
      required: true,
    },
    ptype: {
      type: String,
      required: true,
    },
    pay_latter: {
      type: String,
    },
    balance: {
      type: Number,
      required: true,
    },
    payment_time: {
      type: Number,
      required: true,
    },
    payment_type: {
      type: String,
      required: true,
    },
    payment_money: {
      type: Number,
      required: true,
    },
    due_every: {
      type: Number,
      required: true,
    },
    due_every_month: {
      type: String,
      required: true,
    },
    pay_inout: {
      type: String,
      required: true,
    },
    emi_type: {
      type: String,
    },

    // check_number: {
    //   type: String,
    // },
    // card_number: {
    //   type: String,
    // },
    // card_holder_name: {
    //   type: String,
    // },
    // cvv_number: {
    //   type: String,
    // },
    // card_expiry_date: {
    //   type: String,
    // },
    membership_status: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    transactionId: {},
    subscription_id: {
      type: String,
    },
    cheque_no: {
      type: String,
    },
    mergedDoc: {
      type: String,
    },
    emailToken: {
      type: String,
    },
    membershipIds: [
      {
        type: schema.Types.ObjectId,
        ref: "membership",
        required: true,
      },
    ],
    studentInfo: [
      {
        type: schema.Types.ObjectId,
        ref: "member",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Buy_Membership", Membershipschema);
