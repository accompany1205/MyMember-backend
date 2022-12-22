const Ticket = require("../models/ticket")
const sgMail = require('@sendgrid/mail');
const app = require("../app");
const Mailer = require("../helpers/Mailer");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.createTicket = async (req, res) => {
    try{
        const newTicket = new Ticket({...req.body});
        const response = await newTicket.save();

        const emailData = new Mailer({
            to: [req.body.reqEmail],
            from: `admin+${response._id}@mymanager.com`,
            replyTo: `admin+${response._id}@mymanager.com`,
            subject: req.body.ticketName,
            text: req.body.messages[0].msg,
            attachments: {},
            reqName: response.reqName,
          });
          emailData
            .sendMail()
            .then((resp) => {
                res.json(response);
            })
            .catch((err) => console.log(err));
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
        console.log("new ticket status", status); 
        const oldTicket = await Ticket.findById(ticketId);
        let newStatus = status;
        if(oldTicket.status !== 'spam' && !status){
            if(sender == "agent_msg") {
                newStatus = "pending"
            }
            if(sender == "requester_msg") {
                newStatus = "open"
            }
        }
        let newTicketStatus = newStatus;
        if( oldTicket.status === newTicketStatus ) newTicketStatus = '';
        await Ticket.findByIdAndUpdate(ticketId, {
            status: newStatus,
            "$push": {
                messages: {
                  sender: sender,
                  msg: message,
                  newTicketStatus,
                }
              }
        });

        const updatedTicket = await Ticket.findById(ticketId);

        const emailData = new Mailer({
            to: [updatedTicket.reqEmail],
            from: `admin+${updatedTicket._id}@mymanager.com`,
            replyTo: `admin+${updatedTicket._id}@mymanager.com`,
            subject: updatedTicket.ticketName,
            text: message,
            attachments: {},
          });
          emailData
            .sendMail()
            .then((resp) => {
                res.json(updatedTicket);
            })
            .catch((err) => console.log(err));
        
        
    }
    catch(err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    }
}

exports.replyMessage = async (req, res) => {
    const {from, to, subject, body, date} = req.body;

    // Parse toEmail to get UserId
    const ticketId  = to.split("@")[0].substring(6);

    const result = await Ticket.findByIdAndUpdate(ticketId, {
        $push: {
            messages: {
              sender: "requester_msg",
              msg: str.split("##-Please type your reply above this line-##")[0],
            },
          },
    });

    res.json(result);

    app.socketEngine.notifyNewEmail(result.userId);
}