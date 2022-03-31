const mongoose = require('mongoose');
const schema =  mongoose.Schema;

const TextMessageSchema = schema({
  userId:{
    type:String,
    require:true
  },
  uid:{
    type:String,
    require:true
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
  time: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('text_message', TextMessageSchema);
