const mongoose = require('mongoose');
const schema =  mongoose.Schema
const SMSSchema = schema({
    from:{
      type:String,
      require:true
    },
    to:{
      type:String,
      require:true
    },
    msg:{
      type:String,
      require:true
    },
  },
  { timestamps:true }
)

module.exports = mongoose.model('get_text', SMSSchema)
