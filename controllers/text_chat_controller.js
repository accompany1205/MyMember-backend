const { io } = require("socket.io-client");
const textMessage = require("../models/text_message");
const textContact = require("../models/text_contact");
const member = require("../models/addmember");
const user = require("../models/user");
const mongoose = require("mongoose");
const fcm = require('fcm-notification')
//const Socket = require("../Services/scoket.io")
//var soc = Socket();
let key = require('../fcm_key')
var FCM = new fcm(key);
const socketIo = io("http://localhost:3001", { transports: ['websocket'] })
socketIo.on("connect_error", (err) => {
  console.log(`connect_error due to - ${err.message}`);
});
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
  let { twilio, textCredit } = await user.findOne({ _id: req.params.userId });
  if (textCredit > 0) {
    let { primaryPhone } = await member.findOne({ _id: req.body.uid });
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
        let textMsg = new textMessage(Object.assign({}, req.body, { time: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) }));
        let uid = req.body.uid;
        let textContent = req.body.textContent;
        textMsg.save(async (err, data) => {
          if (err) {
            res.send({ error: 'message not stored' });
          } else {
            let remainingCredit = textCredit - 1;
            await member.findOneAndUpdate({ _id: uid }, { $set: { time: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }), textContent: textContent } })
            await user.findOneAndUpdate({ _id: req.params.userId }, { $set: { textCredit: remainingCredit } })
            res.send({ textMessage: data, success: true, msg: "Message Successfully sent!" });
          }
        });
      }).catch((error) => {
        res.send({ error: 'Failed to send text message to ' + primaryPhone });
        console.log('Error: ', error);
      }).done();
    } else {
      res.send({ error: 'message not sent' });
    }
  } else {
    res.send({ msg: "No Text Credit Availabe, contact Admin! " })
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

exports.searchTextContact = async (req, res) => {
  //let userId = req.params.userId;
  const search = req.query.search;
  try {
    const data = await member.find({
      $or: [
        { lastName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } }
      ]
    });
    res.send({ data: data, success: true })

  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false })
  }
}


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
exports.getTextMessages = async (req, res) => {
  //const io = req.app.get('socketio');
  uidObj = {};
  let date = new Date();
  let uid = req.params.uid;
  let textContent = "test Message!";
  uidObj.time = date;
  uidObj.textContent = textContent;
  uidObj.uid = uid;
  //console.log(socketIo)
  //socketIo.emit("textAlertWebhook", uidObj);

  // const getUid = (phoneNumber, userId) => {
  //   return member.findOne({$and:[ {userId:userId},{primaryPhone: phoneNumber }]}).then(data => {
  //     return data._id;
  //   }).catch(err => {
  //     return '';
  //   });
  // };
  // let val = await getUid("9891943414", "606aea95a145ea2d26e0f1ab");
  // console.log("UID --> ",val)
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
exports.getTextContactsDetails = async (req, res) => {
  const userId = req.params.userId;
  const studentType = req.query.studentType;
  console.log("userId" , userId)
  console.log("studentType", studentType)
  let data;
  try {
    if (studentType === 'Active Trial') {
      data = await contactInfo(userId, studentType)
      return res.send({ data: data, msg: "Success!", success: true });
    } else if (studentType === 'Leads') {
      data = await contactInfo(userId, studentType)
      return res.send({ data: data, msg: "Success!", success: true });
    } else if (studentType === 'Former Student') {
      data = await contactInfo(userId, studentType)
      return res.send({ data: data, msg: "Success!", success: true });
    } else if (studentType === 'Former Trial') {
      data = await contactInfo(userId, studentType)
      return res.send({ data: data, msg: "Success!", success: true });
    } else {
      data = await member.aggregate([
        {
          $match: {
            userId: userId,
            studentType: "Active Student"
          }
        },
        {
          $project: {
            primaryPhone: 1,
            firstName: 1,
            lastName: 1,
            memberprofileImage: 1,
            time: 1,
            textContent: 1
          }
        }
      ]);
      return res.send({ data: data, msg: "Success!", success: true });
    }
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

async function contactInfo(userId, type) {
  try {
    const data = await member.aggregate([
      {
        $match: {
          userId: userId,
          studentType: type
        }
      },
      {
        $project: {
          primaryPhone: 1,
          firstName: 1,
          lastName: 1,
          memberprofileImage: 1,
          time: 1,
          textContent: 1
        }
      }
    ])
    return data
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
}

// Incoming Message API to test SMS
exports.listenIncomingSMS = async (req, res) => {
  const msg = req.body.Body;
  const from = req.body.From;
  let to = req.params.twilio;

  // Pass twilio number as parameter in webhooks

  const getUserId = phoneNumber => {
    // Find userid of user with twilio number
    let phonen = '+' + phoneNumber;
    // Uncomment this in production once twilio number is added
    return user.findOne({ twilio: phonen }).then(data => {
      return data._id;
    }).catch(err => {
      return '';
    });
  };
  // Uncomment this code in production when web hooks is placed for production twilio number
  let userId = await getUserId(to)

  const getUid = (phoneNumber, userId) => {
    let phonen = phoneNumber.slice(2)
    return member.findOne({ $and: [{ userId: userId }, { primaryPhone: phonen }] }).then(data => {
      return data._id;
    }).catch(err => {
      return '';
    });
  };


  const obj = {
    userId: await getUserId(to),
    uid: await getUid(from, userId),
    textContent: msg,
    isSent: false,
  };
  uidObj = {};
  let stuid = await getUid(from, userId);
  uidObj.uid = stuid
  uidObj.time = new Date();
  uidObj.textContent = msg;
  if (obj.userId !== '' && obj.uid !== '') {
    let text = new textMessage(Object.assign({}, obj, { time: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) }));
    text.save().then(async (textMessage) => {
      console.log(socketIo)
      socketIo.emit("textAlertWebhook", uidObj);
      socketIo.emit("push-notification", obj.userId);
      await member.findOneAndUpdate({ _id: stuid }, { $set: { time: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }), textContent: msg } })
      res.send({ msg: 'text sms sent successfully' })
    }).catch(error => {
      res.send({ error: 'txt msg not send' })
    });
  } else {
    res.send({ error: 'txt msg not send due to wrong twilio or phone number' });
  }
}

exports.notification = async (req,res) => {
  let push_notification = (firebase_token,text_msg) =>{
    const token = 'dsfJhffJsjilteAOQGWkBj:APA91bHTMgmPP0UQDAYC85J1fRQRruuVVaBwQHlEVIrNmJiqTXubwcuDC_Pc5_zNC1do72eRbVmwUhirV4F1B7ftjM4vtt-jat8TDIULsOv91-Xq3I_yo0ESR9JrSbEqFU85R98fslfM'
    const msg = {}
    const notification = {}
    const webpush = {}
    notification.title = "My Member"
    notification.body = text_msg
    notification.icon = "http://www.mymember.com/static/media/logo.940eab8a.png"
    webpush.notification = notification
    msg.webpush = webpush
    msg.token = token  
    return new Promise ((resolve,reject)=>{
    FCM.send(msg,(err, response) => {
    if(err){
        reject({msg:false,resp:err})
    }else {
        resolve({msg:true,resp:response}) 
    }
  })
  })
  }
  let twilio = '+17406406682'
  let msg = 'hy'
  let userData = await user.findOne({ twilio: twilio }).exec()
  if(userData){
    let result = await push_notification(userData.firebase_token,msg)
    if(result.msg){
      res.json({success:true,msg:'notification send success',data:result.resp})
    }else{
      res.json({success:false,msg:'notification not send' ,data:result.resp})
    }
  }
}

