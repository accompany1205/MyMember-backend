const mongoose = require("mongoose");
const schema = mongoose.Schema
const addmemberSchema = new schema(
    {
        studentType: {
            type: String

        },
        firstName: {
            type: String

        },
        lastName: {
            type: String

        },
        status: {
            type: String,
            default: 'Inactive'
        },
        days_expire: {
            type: String,
            default: ' '
        },
        dob: {
            type: Date
        },
        day_left: {
            type: String,
            default: ' '
        },
        age: {
            type: String
        },
        gender: {
            type: String

        },
        email: {
            type: String
        },
        primaryPhone: {
            type: String
        },
        secondaryNumber: {
            type: String
        },
        address: {
            type: String
        },
        country: {
            type: String
        },
        state: {
            type: String
        },
        zipPostalCode: {
            type: String
        },
        notes: {
            type: String
        },
        studentBeltSize: {
            type: String
        },
        program: {
            type: String
        },
        programColor: {
            type: String,
            default: ""
        },
        programID: {
            type: String
        },
        next_rank_id: {
            type: String
        },
        next_rank_name: {
            type: String,
            default: ""
        },
        next_rank_img: {
            type: String,
            default: ""
        },
        current_rank_name: {
            type: String,
            default: "No Belt"
        },
        current_rank_img: {
            type: String,
            default: "https://storage.googleapis.com/mymember/All-Images/7dbb2cf0-969e-11eb-b12e-7f5ddf0f0ed7-No%20Belt.jpg"
        },
        current_rank_id: {
            type: String,
            default: ""
        },
        current_stripe: {
            type: Number
        },
        last_stripe_given_date: {
            type: String
        },
        category: {
            type: String
        },
        subcategory: {
            type: String,
            default: ""
        },
        belt_rank_img: {
            type: String

        },
        belt_rank_name: {
            type: String
        },
        location: {
            type: String
        },
        customId: {
            type: String
        },
        leadsTracking: {
            type: String
        },
        staff: {
            type: String
        },
        intrested: {
            type: String
        },
        school: {
            type: String
        },
        memberprofileImage: {
            type: String,
            default: ' '
        },
        rating: {
            type: Number,
            default: 0
        },
        attendence_color: {
            type: String,
            default: '#FF0000'
        },
        class_count: {
            type: Number,
            default: 0
        },
        attendence_status: {
            type: Boolean,
            default: false
        },
        userId: {
            type: String
        },
        membership_details: [{
            type: schema.Types.ObjectId,
            ref: 'Buy_Membership'
        }],
        finance_details: [{
            type: schema.Types.ObjectId,
            ref: 'FinanceInfo'
        }],
        myFaimly: [{
            type: schema.Types.ObjectId,
            ref: 'family'
        }],
        myGroup: [{
            type: schema.Types.ObjectId,
            ref: 'myGroup'
        }],
        test_purchasing: [{
            type: schema.Types.ObjectId,
            ref: 'testpurchase'
        }],
        renewals_notes: [{
            type: schema.Types.ObjectId,
            ref: 'renewalNote'
        }],
        birthday_notes: [{
            type: schema.Types.ObjectId,
            ref: 'birthdayNote'
        }],
        birthday_checklist: [{
            type: schema.Types.ObjectId,
            ref: 'birthdaycheckList'
        }],
        last_contact_missCall: {
            type: Date,
            default: ""
        },
        last_contact_renewal: {
            type: Date,
            default: ""
        },
        missYouCall_notes: [{
            type: schema.Types.ObjectId,
            ref: 'missYouCallNote'
        }],
        followup_notes: {
            type: Array
        },
        rank_update_history:{
            type: Array
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("member", addmemberSchema);
