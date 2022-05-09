const mongoose = require("mongoose");

const eventRegistered = new mongoose.Schema({
    studentId: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
    },
    userId: {
        type: String
    },
    testId: {
        type: String
    }, 
    isPaid: {
        type: Boolean,
        default: false
    },
    method: {
        type: String,
        default: 'unpaid',
        enum: ["Cash", "Check", "Credit Card", 'unpaid']
    },
    cheque_no: {
        type: String
    },
    program: {
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
    next_rank_name: {
        type: String
    },
    current_rank_img: {
        type: String
    },
    next_rank_img: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('eventRegistered', eventRegistered);
