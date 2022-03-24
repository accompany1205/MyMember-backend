const { io } = require("socket.io-client");
const textMessage = require("../models/text_message");
const textContact = require("../models/text_contact");
const member = require("../models/addmember");
const user = require("../models/user");
const mongoose = require("mongoose");

// Adding member in text contact list
exports.addTextContact = (req, res) => {
  let contact = new textContact(req.body);
  contact.save((err, data) => {
    if (err) {
      res.send({ msg: 'contact already added!', success: false });
    } else {
      res.send({ msg: 'contact added!', data, success: true });
    }
  });
};

// Get member list from text contact list
exports.getTextContacts = (req, res) => {
  textContact.find({ from: req.params.userId })
    .populate('textContacts')
    .exec((err, textContactList) => {
      if (err) {
        res.send({ msg: 'text contact list not found', success: false })
      }
      else {
        res.send({ msg: textContactList, success: true })
      }
    });
};

// Send text message and store
exports.sendTextMessage = async (req, res) => {
  const accountSid = process.env.aid;
  const authToken = process.env.authkey;

  // Please uncomment code below in production once we are setting correct twilio number for user
  let { twilio } = await user.findOne({ _id: req.params.userId });
  console.log("twilo", twilio)
  let { primaryPhone } = await member.findOne({ _id: req.body.uid });
  console.log("student ->", primaryPhone)
  const twilioFormat = phoneNumber => {
    if (phoneNumber.charAt(0) !== '+') {
      return '+1' + phoneNumber;
    } else {
      return phoneNumber;
    }
  }
  const client = await require('twilio')(accountSid, authToken);
  if (primaryPhone) {
    await client.messages.create({
      body: req.body.textContent,
      to: twilioFormat(primaryPhone),
      from: twilioFormat(twilio) // This is registered number for Twilio
    }).then((message) => {
      console.log('Text Message sent : ', message);
      let textMsg = new textMessage(req.body);
      let uid = req.body.uid;
      let textContent = req.body.textContent;
      textMsg.save(async (err, data) => {
        if (err) {
          res.send({ error: 'message not stored' });
        } else {
          await member.findOneAndUpdate({_id:uid},{$set:{time:new Date(), textContent:textContent}})
          res.send({ textMessage: data });
        }
      });
      console.log('Message: ', message);
    }).catch((error) => {
      res.send({ error: 'Failed to send text message to ' + primaryPhone });
      console.log('Error: ', error);
    }).done();
  } else {
    console.log('Error sending message');
    res.send({ error: 'message not sent' });
  }
};

// Seen text message and store
exports.seenContactTextMessages = (req, res) => {
  textContact.updateOne({ uid: req.params.contact }, req.body)
    .exec((err, updateFolder) => {
      if (err) {
        res.send({ msg: 'text contact is not update', success: false })
      }
      else {
        res.send({ msg: 'text contact is update successfully', success: true })
      }
    })
};

exports.pinContact = (req, res) => {
  textContact.updateOne({ uid: req.params.contact }, req.body)
    .exec((err, updateFolder) => {
      if (err) {
        res.send({ msg: 'text contact is not update', success: false })
      }
      else {
        res.send({ msg: 'text contact is update successfully', success: true })
      }
    })
};

// Get message list for user
exports.getTextMessages = (req, res) => {
  //const io = req.app.get('socketio');
  uidObj = {};
  let date = new Date();
  let uid = req.params.uid;
  let textContent = "test Message!";
  uidObj.time = date;
  uidObj.textContent = textContent;
  uidObj.uid = uid;
  console.log(uidObj);
  const socketIo = io("http://localhost:3001", { transports: ['websocket'] })
  socketIo.on("connect_error", (err) => {
    console.log(`connect_error due to - ${err.message}`);
  });
  socketIo.emit("textAlertWebhook", uidObj);
  console.log(socketIo);
  // socketIo.on("connect_error", (err) => {
  //   console.log(`connect_error due to - ${err.message}`);
  // });

  //socket.emit(customerId, { test: "something" });
  textMessage.find({ userId: req.params.userId })
    .populate('textMessages')
    .exec((err, textContactList) => {
      if (err) {
        res.send({ error: 'text contact list not found' })
      }
      else {
        res.send(textContactList)
      }
    });
};

// Get members details
exports.getTextContactsDetails = (req, res) => {
  let body = req.body;
  let ids = [];
  if (body.hasOwnProperty('ids')) {
    body.ids.forEach(id => {
      ids.push(mongoose.Types.ObjectId(id));
    });
  }
  member.find({ '_id': { $in: ids } })
    .populate('textContacts')
    .exec((err, textContactList) => {
      if (err) {
        res.send({ error: 'text contact list not found' })
      }
      else {
        res.send(textContactList)
      }
    });
};


// Incoming Message API to test SMS
exports.listenIncomingSMS = async (req, res) => {
  const msg = req.body.Body;
  const from = req.body.From;
  console.log(msg, from)
  // Pass twilio number as parameter in webhooks

  // Uncomment this code in production when web hooks is placed for production twilio number
  let to = req.params.twilio;
  const getUid = phoneNumber => {
    let phonen = phoneNumber.slice(2)
    console.log(phonen)
    return member.findOne({ primaryPhone: phonen }).then(data => {
      return data._id;
    }).catch(err => {
      return '';
    });
  };

  const getUserId = phoneNumber => {
    // Find userid of user with twilio number
    let phonen = '+'+ phoneNumber;
    console.log('to', phonen)
    // Uncomment this in production once twilio number is added
    return user.findOne({ twilio: phonen }).then(data => {
      return data._id;
    }).catch(err => {
      return '';
    });
  };



  const obj = {
    userId: await getUserId(to),
    uid: await getUid(from),
    textContent: msg,
    isSent: false,
  };
  console.log("Message Objects", obj)
  uidObj = {};
  let stuid = await getUid(from);
  uidObj.uid = stuid
  uidObj.time = new Date();
  uidObj.textContent = msg;
  if (obj.userId !== '' && obj.uid !== '') {
    let text = new textMessage(obj);
    text.save().then(async (textMessage) => {
      const socketIo = io("http://localhost:3001", { transports: ['websocket'] })
      socketIo.on("connect_error", (err) => {
        console.log(`connect_error due to - ${err.message}`);
      });
      socketIo.emit("textAlertWebhook", uidObj);
      await member.findOneAndUpdate({_id:stuid},{$set:{time:Date.now(), textContent:msg}})
      res.send({ msg: 'text sms sent successfully' })
    }).catch(error => {
      res.send({ error: 'txt msg not send' })
    });
  } else {
    res.send({ error: 'txt msg not send due to wrong twilio or phone number' });
  }
}
