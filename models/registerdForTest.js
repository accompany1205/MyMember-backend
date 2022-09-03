const mongoose = require("mongoose");

const registerdForTest = new mongoose.Schema({

    studentId: {
        type: String,
        ref: "member",
        index:true
    },
    userId: {
        type: String,
        index:true
    },
    eventId: {
        type:String,
        index:true
    },
    testId: {
        type: String,
        index:true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    rating: {
        type: String
    },
    current_rank_name: {
        type: String
    },
    next_rank_name: {
        type: String
    },
    current_rank_img: {
        type: String
    },
    next_rank_img: {
        type: String
    },
    date: {
        type: Date,
        default: new Date()
    },
    testId: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    method: {
        type: String,
        default: 'unpaid',
        enum: ["Cash", "Check", "Credit Card", 'unpaid']
    },
    primaryPhone: {
        type: String
    },
    cheque_no: {
        type: String
    },
    memberprofileImage: {
        type: String
    },
    lastPromotedDate: {
        type: Date,
        default: new Date()
    },
    program: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now()
    },
    textContent: {
        type: String
    }

});

module.exports = mongoose.model("registerdForTest", registerdForTest)