const mongoose = require("mongoose");

const registerdForTest = new mongoose.Schema({

    studentId: {
        type: String
    },
    userId: {
        typre:String
    },
    testId: {
        type:String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    rating: {
        type: String
    },
    current_rank:{
        type: String
    },
    next_rank:{
        type:String
    },
    current_rank_image:{
        type:String
    },
    next_rank_image:{
        type:String
    },
    date: {
        type: Date,
        default: new Date()
    },
    testId:{
        type:String
    },
    isDeleted:{
        type: Boolean,
        default:false
    },
    method:{
        type:String,
        default: "Cash",
        enum: ["Cash", "Check", "Credit Card"]
    },
    phone:{
        type:String
    },
    memberprofileImage:{
        type:String
    },
    lastPromotedDate:{
        type:Date,
        default: new Date()
    },
    program:{
        type:String
    }

});

module.exports = mongoose.model("registerdForTest", registerdForTest)