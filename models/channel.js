const mongoose = require('mongoose');

const ChannelSchema = mongoose.Schema({
    machineId: {
        type: String,
        required: true,
    },
    adminId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    messages: [
        {
            type: {
                type: String,
                required: true,
            },
            msg: {
                type: String,
                required: false,
            }
        },
        { timestamps: true }
    ]
})

module.exports = mongoose.model('Channel', ChannelSchema);