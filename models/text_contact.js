const mongoose = require('mongoose');
const schema =  mongoose.Schema;

const TextContactSchema = schema({
  uid:{
    type:String,
    require:true,
    unique:true,
    index:true
  },
  from: {
    type:String,
    require:true
  },
  isSeen: {
    type: Boolean,
    default: false,
    index:true
  },
  isPinned: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('text_contact', TextContactSchema);
