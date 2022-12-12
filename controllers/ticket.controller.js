const Ticket = require("../models/ticket")
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

exports.addNewMessage = async (req, res) => {
    const {ticketId, message, status, sender} = req.body;

    try {
        const oldTicket = await Ticket.findById(ticketId);
        let newStatus = status;
        if(oldTicket.status !== 'spam'){
            if(sender == "agent_msg") {
                newStatus = "pending"
            }
            if(sender == "requester_msg") {
                newStatus = "open"
            }
        }
        let newTicketStatus = newStatus;
        if( oldTicket.status === newTicketStatus ) newTicketStatus = '';
        const newTicket = await Ticket.findByIdAndUpdate(ticketId, {
            status: newStatus,
            "$push": {
                messages: {
                  sender: sender,
                  msg: message,
                  newTicketStatus,
                }
              }
            });
            const emailData = {
                sendgrid_key: process.env.SENDGRID_API_KEY,
                to: "xing.liao724@gmail.com",
                from: process.env.from_email,
                //from_name: 'noreply@gmail.com',
                subject: "Ticket was updated",
                html: `<strong>${message}</strong>`,
            };
            sgMail.send(emailData).then((response) => {
                console.log("message sent");
            })
            .catch((error) => {
                console.log("error is", error);
            })
        
        res.json(newTicket);
    }
    catch(err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}