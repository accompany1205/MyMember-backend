const mongoose = require('mongoose');

const TicketSchema  = mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    ticketName: {
        type: String,
        required: true
    },
    requesterName: {
        type: String,
        required: true
    },
    requesterEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    cc: [
    {
        type: String,
        required: false,
    },        
    ],
    messages: [
        {
            sender: {
                type: String,  // This is Enum type : { 'assignee_msg', 'requester_msg' }
                required: true,
            },
            msg: {
                type: String,
                required: false,
            },
            newTicketStatus: {
                type: String,
                required: false,
            }
        }
    ]
})

module.exports = mongoose.model("Ticket", TicketSchema);