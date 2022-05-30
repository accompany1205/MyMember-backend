const mongoose = require("mongoose");

const recommendedForTest = new mongoose.Schema({

    studentId: {
        type: String,
        required: true,
        ref: "member"

    },
    userId: {
        type: String
    },
    eventId: {
        type:String
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
    memberprofileImage: {
        type: String
    },
    primaryPhone: {
        type: String
    },
    program: {
        type: String
    },
    lastPromotedDate: {
        type: Date,
        default: new Date(),
    },
    status: {
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
    next_rank_img: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    current_rank_img: {
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

module.exports = mongoose.model("recommendedForTest", recommendedForTest)