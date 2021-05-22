const accountSid = 'AC95c8e5b269c098f81fac4bbc8ce8f881';
const authToken = 'af2e5bd3153fe38cd556686959194c48';
const client = require('twilio')(accountSid, authToken);
const sgmail = require("sendgrid-v3-node");

function service(){
    this.sendSms = (smsText,to) => {
        return new Promise((resolve, reject) => {
            var code = '+91'
            client.messages.create({
                body: smsText,
                from: '+12672637681',
                to: `${code}`+to
               }).then((resp)=>{
                   resolve('success')
               }).catch((error)=>{
                   reject('error')
                   console.log(error)
               })
        })
    }

    this.sendEmail = (emailText,to) => {

        return new Promise((resolve, reject) => {
            const emaildata = {
                sendgrid_key: process.env.Email_Key,
                to:to,
                from_email: 'ankit.jain.mit@gmail.com',
                from_name: "noreply@gmail.com",
              };
          
              emaildata.subject = 'Miss You Call';
              emaildata.content = emailText;
          
              sgmail.send_via_sendgrid(emaildata).then((resp) => {
                resolve('success')
                })
                .catch((error) => {
                    reject('error')
                });
        })
    }
}

module.exports = new service()
