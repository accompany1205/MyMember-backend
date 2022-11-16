const express = require("express");
const router = express.Router();
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const ClientCapability = twilio.jwt.ClientCapability;
const VoiceResponse = twilio.twiml.VoiceResponse;
// Generate a Twilio Client capability token
router.get('/token', (request, response) => {
    const capability = new ClientCapability({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
    });

    capability.addScope(
        new ClientCapability.OutgoingClientScope({
            applicationSid: process.env.TWILIO_TWIML_APP_SID
        })
    );

    const token = capability.toJwt();
    console.log('token', token)
    // Include token in a JSON response
    response.send({
        token: token,
    });
});

router.get("/audioCall", (req, res) => {
    console.log('call audio')
    try {
        client.calls
            .create({
                twiml: '<Response><Say>mujahid, World!</Say></Response>',
                to: '+18323041166',
                // from: '+19593012429'
                from:'+12059973433'
            })
            .then(call => console.log('call sid', call.sid));
    } catch (e) {
        console.log("error in audio call", e)
    }
})

module.exports = router;