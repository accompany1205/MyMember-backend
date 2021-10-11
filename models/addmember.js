const mongoose = require("mongoose");
const schema = mongoose.Schema
const addmemberSchema = new schema(
    {
        studentType: {
            type: String,
            required:true

        },
        firstName: {
            type: String,
            required:true

        },
        lastName: {
            type: String,
            required:true

        },
        status: {
            type: String,
            default: 'Inactive',
            required:true
        },
        days_expire: {
            type: String,
            default: ' ',
            required:true
        },
        dob: {
            type: Date,
            required:true
        },
        day_left: {
            type: String,
            default: ' ',
            required:true
        },
        age: {
            type: String,
            required:true
        },
        gender: {
            type: String,
            required:true

        },
        email: {
            type: String,
            required:true
        },
        primaryPhone: {
            type: String,
            required:true
        },
        secondaryNumber: {
            type: String,
            required:true
        },
        address: {
            type: String,
            required:true
        },
        country: {
            type: String,
            required:true
        },
        state: {
            type: String,
            required:true
        },
        zipPostalCode: {
            type: String,
            required:true
        },
        notes: {
            type: String,
            required:true
        },
        studentBeltSize: {
            type: String,

        },
        program: {
            type: String,
            required:true
        },
        programColor: {
            type: String,
            default: "",
            required:true
        },
        programID: {
            type: String,
            required:true
        },
        next_rank_id: {
            type: String,
            required:true
        },
        next_rank_name: {
            type: String,
            default: "",
            required:true
        },
        next_rank_img: {
            type: String,
            default: "",
            required:true
        },
        current_rank_name: {
            type: String,
            default: "No Belt",
            required:true
        },
        current_rank_img: {
            type: String,
            default: "https://storage.googleapis.com/mymember/All-Images/7dbb2cf0-969e-11eb-b12e-7f5ddf0f0ed7-No%20Belt.jpg",
            required:true
        },
        current_rank_id: {
            type: String,
            default: "",
            required:true
        },
        current_stripe: {
            type: Number,
            required:true
        },
        last_stripe_given_date: {
            type: String,
            required:true
        },
        category: {
            type: String,
            required:true
        },
        subcategory: {
            type: String,
            default: "",
            required:true
        },
        belt_rank_img: {
            type: String,
            required:true

        },
        belt_rank_name: {
            type: String,
            required:true
        },
        location: {
            type: String,
            required:true
        },
        customId: {
            type: String,
            required:true
        },
        leadsTracking: {
            type: String,
            required:true
        },
        staff: {
            type: String,
            required:true
        },
        intrested: {
            type: String,
            required:true
        },
        school: {
            type: String,
            required:true
        },
        memberprofileImage: {
            type: String,
            default: ' ',
            required:true
        },
        rating: {
            type: Number,
            default: 0,
            required:true
        },
        attendence_color: {
            type: String,
            default: '#FF0000',
            required:true
        },
        class_count: {
            type: Number,
            default: 0,
            required:true
        },
        attendence_status: {
            type: Boolean,
            default: false,
            required:true
        },
        userId: {
            type: String,
            required:true
        },
        membership_details: [{
            type: schema.Types.ObjectId,
            ref: 'Buy_Membership',
            required:true
        }],
        finance_details: [{
            type: schema.Types.ObjectId,
            ref: 'FinanceInfo',
            required:true
        }],
        myFaimly: [{
            type: schema.Types.ObjectId,
            ref: 'family',
            required:true
        }],
        myGroup: [{
            type: schema.Types.ObjectId,
            ref: 'myGroup',
            required:true
        }],
        test_purchasing: [{
            type: schema.Types.ObjectId,
            ref: 'testpurchase',
            required:true
        }],
        renewals_notes: [{
            type: schema.Types.ObjectId,
            ref: 'renewalNote',
            required:true
        }],
        birthday_notes: [{
            type: schema.Types.ObjectId,
            ref: 'birthdayNote',
            required:true
        }],
        birthday_checklist: [{
            type: schema.Types.ObjectId,
            ref: 'birthdaycheckList',
            required:true
        }],
        last_contact_missCall: {
            type: Date,
            default: "",
            required:true
        },
        last_contact_renewal: {
            type: Date,
            default: "",
            required:true
        },
        missYouCall_notes: [{
            type: schema.Types.ObjectId,
            ref: 'missYouCallNote',
            required:true
        }],
        followup_notes: {
            type: Array,
            required:true
        },
        rank_update_history:{
            type: Array,
            required:true
        },
        rank_update_test_history:{
            type: Array,
            required:true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("member", addmemberSchema);
    