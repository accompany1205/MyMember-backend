const mongoose = require("mongoose");

const recommendedCandidate = new mongoose.Schema({

    studentId: {
        type: String,
        required: true,
        index:true
    },
    userId: {
        type: String,
        index:true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    memberprofileImage: {
        type: String
    },
    phone: {
        type: String
    },
    program: {
        type: String
    },
    lastPromotedDate: {
        type: Date,
        default: new Date(),
    },
    rating: {
        type: Number
    },
    current_rank_name: {
        type: String
    },
    current_rank_img: {
        type: String
    },
    next_rank_name: {
        type: String
    },
    next_rank_img: {
        type: String
    },
    candidate: {
        type: String,
    },
    candidate_status: {
        type: String,
        default: null
    },
    last_stripe_given: {
        type: String,
        default: new Date(),
    },
    current_stripe: {
        type: String,
        default: '0'
    },
    next_stripe: {
        type: String,
    },
    stripe_history: {
        type: Array,
    },
    joinHistory: {
        type: Array,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
},
    { timestamps: true }
);


module.exports = mongoose.model("recommendedCandidate", recommendedCandidate)