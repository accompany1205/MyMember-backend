const mongoose = require("mongoose");

const registerdForTest = new mongoose.Schema({

    studentId: {
        type: String
    },
    userId: {
        typre:String
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
    current_rank_img:{
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
    }

});

module.exports = mongoose.model("registerdForTest", registerdForTest)