const mongoose = require("mongoose");

const recommendedForTest = new mongoose.Schema({

    studentId: {
        type: String,
        required:true,
        unique:true
    },
    userId:{
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    memberprofileImage:{
        type:String
    },
    phone:{
        type:String
    },
    program:{
        type:String
    },
    lastPromotedDate:{
        type:Date,
        default: new Date(),
    },
    status:{
        type:String
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
    isDeleted:{
        type: Boolean,
        default: false
    },
    current_rank_name:{
        type:String
        }

});

module.exports = mongoose.model("recommendedForTest", recommendedForTest)