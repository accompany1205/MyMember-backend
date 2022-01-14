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
      res.send({error: 'contact not added'});
    } else {
      res.send({textContact: data});
    }
  });
};

// Get member list from text contact list
exports.getTextContacts = (req, res) => {
  textContact.find({from: req.params.userId})
    .populate('textContacts')
    .exec((err,textContactList)=>{
      if(err){
        res.send({error:'text contact list not found'})
      }
      else{
        res.send(textContactList)
      }
    });
};

// Send text message and store
exports.sendTextMessage = async (req, res) => {
  const accountSid = process.env.aid;
  const authToken = process.env.authkey;
  let orgPhone = process.env.phone; // TODO: get it from user table

  // Please uncomment code below in production once we are setting correct twilio number for user
  // let {twilio} = await user.findById(req.params.userId);
  // orgPhone = twilio;

  let {primaryPhone} = await member.findById(req.body.uid);
  const client = await require('twilio')(accountSid, authToken);
  if (primaryPhone) {
    await client.messages.create({
      body: req.body.textContent,
      to: primaryPhone,
      from: orgPhone // This is registered number for Twilio
    }).then((message) => {
      console.log('Text Message sent : ', message);
      let textMsg = new textMessage(req.body);
      textMsg.save((err, data) => {
        if (err) {
          res.send({error: 'message not stored'});
        } else {
          res.send({textMessage: data});
        }
      });
      console.log('Message: ', message);
    }).catch((error) => {
      res.send({error: 'Failed to send text message to ' + primaryPhone});
      console.log('Error: ', error);
    }).done();
  } else {
    console.log('Error sending message');
    res.send({error: 'message not sent'});
  }
};

// Seen text message and store
exports.seenContactTextMessages = (req, res) => {
  textContact.updateOne({uid: req.params.contact},req.body)
    .exec((err,updateFolder)=>{
      if(err){
        res.send({error:'text contact is not update'})
      }
      else{
        res.send({msg:'text contact is update successfully'})
      }
    })
};

exports.pinContact = (req, res) => {
  textContact.updateOne({uid: req.params.contact},req.body)
    .exec((err,updateFolder)=>{
      if(err){
        res.send({error:'text contact is not update'})
      }
      else{
        res.send({msg:'text contact is update successfully'})
      }
    })
};

// Get message list for user
exports.getTextMessages= (req, res) => {
  textMessage.find({userId: req.params.userId})
    .populate('textMessages')
    .exec((err,textContactList)=>{
      if(err){
        res.send({error:'text contact list not found'})
      }
      else{
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
  member.find({'_id': {$in: ids}})
    .populate('textContacts')
    .exec((err,textContactList)=>{
    if(err){
      res.send({error:'text contact list not found'})
    }
    else{
      res.send(textContactList)
    }
  });
};


// Incoming Message API to test SMS
exports.listenIncomingSMS = async (req, res) => {
  const msg = req.body.hasOwnProperty('Body') ? req.body.Body : 'Failed to receive sms';
  const from = req.from.hasOwnProperty('From') ? req.from.From : 'Unknown sender';
  let to =  process.env.phone; // TODO: Use company twilio number

  // Pass twilio number as parameter in webhooks

  // Uncomment this code in production when web hooks is placed for production twilio number
  // let {twilio} = await user.findById(req.params.userId);
  // to = twilio;

  const getUid = phoneNumber => {
    return member.findOne({primaryPhone: from}).then(data => {
      return data._id;
    });
  };

  const getUserId = phoneNumber => {
    // TODO: Update after twilio number is added
    // Find userid of user with twilio number

    // Uncomment this in production once twilio number is added
    // return user.findOne({twilio: phoneNumber}).then(data => {
    //   return data._id;
    // });

    // Remove below code in production once twilio number is added
    // Below is hardcoded user id should be removed after twilio number per organization logic is added
    let userId = '606aea95a145ea2d26e0f1ab';

    return userId;
  };

  const obj = {
    userId: await getUserId(to),
    uid: await getUid(from),
    textContent:  msg,
    isSent: false,
  };

  let text = new textMessage(obj);

  text.save().then(textMessage => {
    res.send({msg:'text sms sent successfully'})
  }).catch(error => {
    res.send({error:'txt msg not send'})
  });

}
