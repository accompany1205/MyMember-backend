const mongoose = require("mongoose");

const recommendedCandidate = new mongoose.Schema({

    studentId: {
        type: String,
        required: true
    },
    userId: {
        type: String
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
        default: null
    },
    candidate_status: {
        type: String,
        default: null
    },
    stripe: {
        type: String,
        default: null
    },
    last_stripe: {
        type: String,
        default: null
    },
    current_stripe: {
        type: String,
        default: null
    },
    next_stripe: {
        type: String,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },


});


module.exports = mongoose.model("recommendedCandidate", recommendedCandidate)