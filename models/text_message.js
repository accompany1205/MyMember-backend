const mongoose = require('mongoose');
const schema =  mongoose.Schema;

const TextMessageSchema = schema({
  userId:{
    type:String,
    require:true,
    index: true,
    index:true
  },
  uid:{
    type:String,
    require:true,
    index:true
  },
  textContent: {
    type:String,
    require:true
  },
  isSent: {
    type: Boolean,
    default: true,
    require:true
  },
  isSeen:{
    type: String,
    default:null,
    index: true,
    index:true
  },
  time: {
    type:String,
    default: new Date().toLocaleString('en-US', {  timeZone: 'America/New_York'})
  }
});

module.exports = mongoose.model('text_message', TextMessageSchema);
