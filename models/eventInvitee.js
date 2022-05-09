const mongoose = require("mongoose");

const eventInvitee = new mongoose.Schema({
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
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    memberprofileImage: {
        type: String
    },
    program: {
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

module.exports = mongoose.model('eventinvite', eventInvitee);
