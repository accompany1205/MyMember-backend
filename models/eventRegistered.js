const mongoose = require("mongoose");

const eventRegistered = new mongoose.Schema({
    studentId: {
        type: String,
        required: true
    },
    eventId:{
        type:String,
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

module.exports = mongoose.model('eventRegistered', eventRegistered);
