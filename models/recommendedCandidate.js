const mongoose = require("mongoose");

const recommendedCandidate = new mongoose.Schema({

    memberprofileImage:{
        type: String
    },
    studentId: {
        type: String
    },
    stripeId:{
        type: String
    },
    stripeName:{
        type: String
    },
    userId:{
        type: String
    },
    fullName: {
        type: String
    },
    current_rank_id:{
        type: String
    },
    current_rannk_img:{
        type: String
    },
    current_rank_name:{
        type: String
    },
    current_stripe:{
        type: Number,
        default:0
    },
    recommededDate: {
        type: Date,
        default: new Date()
    },
    lastStripeUpdatedDate: {
        type: Date
    },
    isDeleted:{
        type: Boolean,
        default: false
    }

}); 

module.exports = mongoose.model("recommendedCandidate", recommendedCandidate)