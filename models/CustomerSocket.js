const mongoose = require('mongoose');

const CustomerSocketSchema = new mongoose.Schema({
    socketId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model("customerSocket", CustomerSocketSchema);