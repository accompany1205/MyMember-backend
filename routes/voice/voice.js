const config = require("./config");
const express = require("express");

const router = express.Router();
const VoiceRecord = require('../../models/voice_recording');
const MyWalletModal = require('../../models/Mywallet');
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

router.get('/muj1', (req, res) => {
  res.json({ success: false, msg: 'send' })
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
  // console.log('voice here')
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
  // console.log("body ===> ", req.body);
  let { recording, user_id, To } = req.body;
  console.log("res is here", To)
  try {

    if (recording == "true") {
      console.log('true calling')
      response = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Dial callerId='+12059973433'  recordingStatusCallback='https://f2ca-206-84-188-48.ap.ngrok.io/v1/voice_recording?user_id=${user_id + "," + To}'  record='record-from-ringing' >+18323041166</Dial>
        <Say>Goodbye</Say>
    </Response>`;

      let data = {
        recording_url: "",
        user_id: "",
        num: req.body.To,
        duration: ""

      }
      // VoiceRecord(data).save()
      //   .then((item) => res.send({ success: true, data: item }))
      res.send(response);
    }
    else {
      console.log('false calling')
      response = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Dial callerId='+12059973433'>+18323041166</Dial>
        <Say>Goodbye</Say>
    </Response>`;

      // VoiceRecord(data).save()
      //   .then((item) => res.send({ success: true, data: item }))
      res.send(response);
    }

    // VoiceRecord(data).save()
    //   .then((item) => res.json({ success: true, data: item }))
    // res.send(response);
  } catch (e) {
    // res.json({ success: true, msg: "Server Error" })
    console.log('e')
  }
});
router.post("/voice_recording", async (req, res) => {
  try {
    console.log("body voice req",);
    let url = "/voice_recording?user_id=606aea95a145ea2d26e0f1ab,+18323041166b"
    console.log("url", url?.split("?user_id=")[1].split(','))
    // console.log("body voice res", res.data);
    let data = {
      recording_url: req?.body?.RecordingUrl,
      user_id: req?.url?.split("?user_id=")[1].split(',')[0],
      num: req?.url?.split("?user_id=")[1].split(',')[1],
      duration: req?.body?.RecordingDuration
    }
    await VoiceRecord(data).save()
      .then((item) => {
        res.json({ success: true, data: item })
      })

    // subtracts credits on call end
    let callDuration = +req?.body?.RecordingDuration / 60;


    let creditsSubtract = callDuration.toFixed(0) == 0 ? 2 : callDuration.toFixed(0) == 1 ? 2 : callDuration.toFixed(0) == 2 ? 4 : callDuration.toFixed(0)
    console.log("creditsSubtract", creditsSubtract);

    const doesUserExist = await MyWalletModal.findOne({ user_id: req?.url?.split("?user_id=")[1].split(',')[0] });
    console.log('findUser', doesUserExist)
    if (doesUserExist) {
      // let findUser = await MyWalletModal.findById({user_id})
      // console.log('findUser', findUser)
      let creditsInfo = await MyWalletModal.findByIdAndUpdate(doesUserExist._id, { $inc: { cretits: -2, } }, {
        new: true,
        runValidators: true
      })
      res.status(200).json({
        success: true,
        data: creditsInfo
      })
    }
    else {
      MyWalletModal(req.body).save()
        .then((item) => res.json({ success: true, data: item }))

    }
  } catch (e) {
    res.json({ success: false, data: "Something went wrong" })
    console.log("ee", e)
  }

});
router.get("/showCallHistory/:user_id", async (req, res) => {
  console.log('call here');
  let { user_id } = req.params;
  try {
    let record = await VoiceRecord.find({ user_id: user_id })
    if (record) {
      res.status(200).json({
        success: true,
        data: record
      })
    } else {
      res.json({ success: false, data: "Something went wrong" })
    }
  } catch (e) {
    console.log('e', e)
  }
})

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
module.exports = router;
