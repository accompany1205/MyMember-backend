const Ticket = require("../models/ticket")
const sgMail = require('@sendgrid/mail');
const app = require("../app");
const Mailer = require("../helpers/Mailer");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.createTicket = async (req, res) => {
    try{
        const newTicket = new Ticket({...req.body});
        const response = await newTicket.save();

        if(req.body.messages && req.body.messages.length > 0) {
            const emailData = new Mailer({
                to: [req.body.reqEmail],
                from: `admin+${response._id}@mymanager.com`,
                replyTo: `admin+${response._id}@mymanager.com`,
                subject: req.body.ticketName,
                text: req.body.messages[req.body.messages.length - 1].msg,
                attachments: {},
                reqName: response.reqName,
                html: `<html>
                <head>
            
                </head>
                <body style="background-color: #f5f6fb; font-size: 11px;">
                    
                    <div style="width: 80%; max-width: 500px; background-color: white; margin: auto; padding: 20px; margin-top: 20px; margin-bottom: 20px;">
                        <div style="padding:10px; border-bottom: 1px solid #bea1a1;">
                            <span style="color: #b1aeae;">##-Please type your reply above this line-##</span>
                        </div>
                        <div style="padding: 10px; font-size: 12px;">
                            <p style="color: #1b1a1a;">
                                Hello ${response.reqName}
                                <br>
                                <br>
                                ${req.body.messages[req.body.messages.length - 1].msg}
                            </p>
                        </div>
                        <div style="padding: 10px; border-top: 1px solid #bea1a1;">
                            <div style="color: #b1aeae; line-height: 1.7;">This email is a service from BBQGuys Sales</div>
                            <div style="color: #b1aeae;">Deliverd by Mymember</div>
                        </div>
                    </div>
                </body>
            </html>`
              });
              emailData
                .sendMail()
                .then((resp) => {
                    res.json(response);
                })
                .catch((err) => console.log(err));
        }

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
            reqName: reqName,
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


    const sentences = body.split("\n");
    let resMessage = "";
    for (let i =0 ;i< sentences.length; i++){
        if(sentences[i].includes("On") && sentences[i].includes("wrote:") && sentences[i].includes("@")) break;
        if(sentences[i].includes("On") && sentences[i + 1].includes("wrote:") && sentences[i + 1].includes("@")) 
        {
            break;
        }
        resMessage = resMessage.concat(sentences[i]);
    }

    const result = await Ticket.findByIdAndUpdate(ticketId, {
        $push: {
            messages: {
              sender: "requester_msg",
              msg: resMessage,
            },
          },
    });

    res.json(result);

    app.socketEngine.notifyNewEmail(result.userId, result.reqName, resMessage);
}