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
exports.sendTextMessage = (req, res) => {
  let message = new textMessage(req.body);
  message.save((err, data) => {
    if (err) {
      res.send({error: 'message not stored'});
    } else {
      res.send({textMessage: data});
    }
  });
};

// Get message list for user
exports.getTextMessages= (req, res) => {
  textMessage.find({from: req.params.userId})
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
  console.log('Body: ', body);
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

