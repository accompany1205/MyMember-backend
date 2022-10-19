const config = require("./config");
const express = require("express");

const router = express.Router();
// const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();
const { chatToken, videoToken, voiceToken } = require("./voiceToken");
const { VoiceResponse } = require("twilio").twiml;

router.use(pino);

const sendTokenResponse = (token, res) => {
  res.set("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

router.get("/api/greeting", (req, res) => {
  const name = req.query.name || "World";
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

router.get('/muj1', (req, res)=>{
  res.json({success:false, msg:'send'})
})

router.get("/chat/token", (req, res) => {
  const identity = req.query.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

router.post("/chat/token", (req, res) => {
  const identity = req.body.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

router.get("/video/token", (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

router.post("/video/token", (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

router.get("/voice/token", (req, res) => {
  console.log('voice here')
  const identity = req.query.identity;
  const token = voiceToken(identity, config);
  sendTokenResponse(token, res);
});

router.post("/voice/token", (req, res) => {
  const identity = req.body.identity;
  const token = voiceToken(identity, config);
  sendTokenResponse(token, res);
});
router.post("/twiml", (req, res) => {
  console.log("body", req.body)
 
  response = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
      <Dial callerId='+12059973433'>+18323041166</Dial>
      <Say>Goodbye</Say>
  </Response>`;
  res.send(response);
});

router.post("/voice", (req, res) => {
  const To = req.body.To;
  const response = new VoiceResponse();
  const dial = response.dial({ callerId: config.twilio.callerId });
  dial.number(To);
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});

router.post("/voice/incoming", (req, res) => {
  const response = new VoiceResponse();
  const dial = response.dial({ callerId: req.body.From, answerOnBridge: true });
  dial.client("phil");
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});
module.exports = router
