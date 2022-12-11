const Ticket = require("../models/ticket")

exports.createTicket = async (req, res) => {
    try{
        const newTicket = new Ticket({...req.body});
        const response = await newTicket.save();
        res.json(response);
    }
    catch(err){
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.getAllTicketsByUserId = async (req, res) => {
    const { userId } = req.params;
    try{
        const tickets = await Ticket.find({ userId });
        res.json(tickets);
    }
    catch(err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.getTicketsByStatus = async (req, res) => {
    const { userId, ticketStatus } = req.params;
    try {
        const tickets = await Ticket.find({ userId, status: ticketStatus });
        res.json(tickets);
    }
    catch(err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.getTicketById = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const ticket = await Ticket.findById(ticketId);
        res.json(ticket);
    }
    catch(err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

// TODO: update ticket message

exports.updateTicketMessage = async (req, res) => {

}

exports.deleteTicketMessage = async (req, res) => {
    const { ticketId } = req.params;
    try {
        await Ticket.findByIdAndDelete(ticketId);
    }
    catch(err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}