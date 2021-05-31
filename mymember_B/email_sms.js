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

    this.sendEmailReg = (to) => {

        return new Promise((resolve, reject) => {
            const emaildata = {
                sendgrid_key: process.env.Email_Key,
                to:to,
                from_email: 'ankit.jain.mit@gmail.com',
                from_name: "noreply@gmail.com",
              };
          
              emaildata.subject = 'My Member Registration';
              emaildata.content = `<div class="text-center" style="width: 100%; text-align: center;display: inline-block;padding: 70px 0px;">
                                   <img src="logo.png" style="width: 100px; margin-top: 20px;" />
                                   <h1 style="color: #0080ae; font-family:Arial, Helvetica, sans-serif; font-size: 65px;font-weight: 400; margin-top: 25px;margin-bottom: 0px;">Thank You!</h1>
                                   <h3 style="color: #0080ae; font-family:Arial, Helvetica, sans-serif; font-size: 30px;font-weight: 300;margin-top:5px; margin-bottom: 20px;">You have registered successfully!</h3>
                        <hr>
                        <p style="color: #0080ae; font-family:Arial, Helvetica, sans-serif; font-size: 18px;font-weight: 100;margin-top:5px; margin-bottom: 20px;">
                            Thank You for Registration, Our team will get back to you soon! We will notify you on your account activation!
                        </p>
                        <p class="lead">
                            <a class="" href="#" role="button" style="color: #fff; background-color:#0080ae; display: inline-block;text-decoration: none;font-size: 16px; padding:12px; border-radius: 4px; font-family:Arial, Helvetica, sans-serif; ">Continue to Homepage</a>
                        </p>
                        </div>`;
          
              sgmail.send_via_sendgrid(emaildata).then((resp) => {
                resolve('success')
                })
                .catch((error) => {
                    console.log(error)
                    reject('error')
                });
        })
    }
}

module.exports = new service()
