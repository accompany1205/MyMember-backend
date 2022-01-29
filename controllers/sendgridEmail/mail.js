const axios = require("axios");
const sgMail = require("sendgrid-v3-node");
let key = process.env.SENDGRID_API_KEY;


class emailSender {

    mainSender = async (paylaod) => {
        const emailData = {
            sendgrid_key: key,
            to: paylaod.to,
            from_email: process.env.from_email,
            from_name: "noreply@gmail.com",
            subject: paylaod.subject,
            content: paylaod.template,
            attachments: paylaod.attachments,
            sendAt:payload.sendAt
        };

    }




}


