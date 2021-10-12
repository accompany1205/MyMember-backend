const mongoose = require("mongoose");

const recommendedForTest = new mongoose.Schema({

    studentId: {
        type: String,
        required:true,
        unique:true
    },
    userId:{
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
    memberprofileImage:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    program:{
        type:String,
        required:true
    },
    lastPromotedDate:{
        type:Date,
        default: new Date(),
        required:true
    },
    status:{
        type:String,
        required:true
    },
    rating: {
        type: String,
        required:true
    },
    current_rank:{
        type: String,
        required:true
    },
    next_rank:{
        type:String,
        required:true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    current_rank_name:{
        type:String,
        required:true
    }

});

module.exports = mongoose.model("recommendedForTest", recommendedForTest)