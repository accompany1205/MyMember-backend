const mongoose = require("mongoose");

const eventRegistered = new mongoose.Schema({
    studentId: {
        type: String,
        required: true
    },
    eventName: {
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
    current_rank_name: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})