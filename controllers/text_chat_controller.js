const textMessage = require("../models/text_message");
const textContact = require("../models/text_contact");
const member = require("../models/addmember");
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
  const orgPhone = process.env.phone;
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
  member.find({'_id': {$in: [ids]}})
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
