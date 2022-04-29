const mongoose = require('mongoose');
const schema = mongoose.Schema;

const addmemberSchema = new schema(
  {
    studentType: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    status: {
      type: String,
      default: "Inactive",
    },
    days_expire: {
      type: String,
      default: " ",
    },
    dob: {
      type: Date,
    },
    day_left: {
      type: String,
      default: " ",
    },
    age: {
      type: String,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
    },
    primaryPhone: {
      type: String,
    },
    secondaryNumber: {
      type: String,
    },
    street: {
      type: String,
    },
    town: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zipPostalCode: {
      type: String,
    },
    notes: {
      type: String,
    },
    studentBeltSize: {
      type: String,
    },
    program: {
      type: String,
    },
    programColor: {
      type: String,
      default: "",
    },
    programID: {
      type: String,
    },
    next_rank_id: {
      type: String,
    },
    next_rank_name: {
      type: String,
      default: "",
    },
    next_rank_img: {
      type: String,
      default: "",
    },
    current_rank_name: {
      type: String,
      default: "No Belt",
    },
    rank_order: {
      type: Number,
    },
    current_rank_img: {
      type: String,
    },
    current_rank_id: {
      type: String,
      default: "",
    },
    candidate: {
      type: String
    },
    current_stripe: {
      type: String,
    },
    last_stripe_given_date: {
      type: String,
    },
    category: {
      type: String,
    },
    subcategory: {
      type: String,
      default: "",
    },
    belt_rank_img: {
      type: String,
    },
    belt_rank_name: {
      type: String,
    },
    location: {
      type: String,
    },
    customId: {
      type: String,
    },
    leadsTracking: {
      type: Array,
    },
    after_camp: {
      type: Array,
    },
    summer_camp: {
      type: String,
    },
    speciality_program1: {
      type: String,
    },
    speciality_program2: {
      type: String,
    },
    staff: {
      type: String,
    },
    intrested: {
      type: String,
    },
    school: {
      type: String,
    },
    memberprofileImage: {
      type: String,
      default: " ",
    },
    rating: {
      type: Number,
      default: 0,
    },
    attendence_color: {
      type: String,
      default: "#FF0000",
    },
    missclass_count: {
      type: Number,
      default: 0,
    },
    attendedclass_count: {
      type: Number,
      default: 0,
    },
    attendence_status: {
      type: Boolean,
      default: false,
    },
    buyerInfo: {
      firstName: String,
      lastName: String,
      gender: String,
      dob: String,
      age: String
    },
    userId: {
      type: String,
    },
    rankFromRecomendedTest: {
      type: Array,
    },
    membership_details: [
      {
        type: schema.Types.ObjectId,
        ref: "Buy_Membership",
      },
    ],
    product_details: [
      {
        type: schema.Types.ObjectId,
        ref: "Buy_Product",
      },
    ],
    finance_details: [
      {
        type: schema.Types.ObjectId,
        ref: "FinanceInfo",
      },
    ],
    myFaimly: [
      {
        type: schema.Types.ObjectId,
        ref: "family",
      },
    ],
    myGroup: [
      {
        type: schema.Types.ObjectId,
        ref: "myGroup",
      },
    ],
    test_purchasing: [
      {
        type: schema.Types.ObjectId,
        ref: "testpurchase",
      },
    ],
    renewals_notes: [
      {
        type: schema.Types.ObjectId,
        ref: "renewalNote",
      },
    ],
    birthday_notes: [
      {
        type: schema.Types.ObjectId,
        ref: "birthdayNote",
      },
    ],
    birthday_checklist: [
      {
        type: schema.Types.ObjectId,
        ref: "birthdaycheckList",
      },
    ],
    last_contact_missCall: {
      type: Date,
      default: "",
    },
    last_contact_renewal: {
      type: Date,
      default: "",
    },
    missYouCall_notes: [
      {
        type: schema.Types.ObjectId,
        ref: "missYouCallNote",
      },
    ],
    followup_notes: {
      type: Array,
    },
    rank_update_history: {
      type: Array,
    },
    rank_update_test_history: {
      type: Array,
    },
    isRecomCandidate: {
      default: false,
      type: Boolean,
    },
    isRecommended: {
      default: false,
      type: Boolean,
    },
    time: {
      type: Date,
      default: Date.now()
    },
    isInvitee: {
      type: Boolean,
      default: false
    },
    textContent: {
      type: String
    }
  },

  { timestamps: true }
);

module.exports = mongoose.model('member', addmemberSchema);
