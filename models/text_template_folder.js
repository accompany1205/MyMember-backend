const mongoose = require("mongoose");
const schema = mongoose.Schema

const templateFolder = new schema({
  folderName:{
    type:String,
    required:true
  },
  subFolder:[{
    type:schema.Types.ObjectId,
    ref:'templateSubFolder'
  }],
  userId:{
    type:String
  },
  createdBy:{
    type:String
  }
})

module.exports = mongoose.model("templateFolder", templateFolder);

