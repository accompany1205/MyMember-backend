const mongoose = require("mongoose");

const recommendedForTest = new mongoose.Schema({

    studentId: {
        type: String
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
    rating: {
        type: String
    },
    current_rank:{
        type: String
    },
    next_rank:{
        type:String
    },
    date: {
        type: Date,
        default: new Date()
    },
    isDeleted:{
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model("recommendedForTest", recommendedForTest)