const mongoose = require('mongoose');
const schema =  mongoose.Schema;

const TextContactSchema = schema({
  uid:{
    type:String,
    require:true
  },
  from: {
    type:String,
    require:true
  }
});

module.exports = mongoose.model('text_contact', TextContactSchema);
