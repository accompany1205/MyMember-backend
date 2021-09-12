const mongoose = require("mongoose");

const recommendList = new mongoose.Schema({

    studentId: {
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
    date: {
        type: Date,
        default: new Date()
    }


});

module.exports = mongoose.model("recommended", recommendList)