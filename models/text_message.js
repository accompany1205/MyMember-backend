const mongoose = require('mongoose');
const schema =  mongoose.Schema;

const TextMessageSchema = schema({
  from:{
    type:String,
    require:true
  },
  to:{
    type:String,
    require:true
  },
  textContent: {
    type:String,
    require:true
  },
  time: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('text_message', TextMessageSchema);
