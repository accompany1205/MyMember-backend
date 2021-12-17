const mongoose = require('mongoose');
const schema =  mongoose.Schema;

const TextContactSchema = schema({
  uid:{
    type:String,
    require:true,
    unique:true,
  },
  from: {
    type:String,
    require:true
  },
  isSeen: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('text_contact', TextContactSchema);
