const mongoose = require("mongoose");
const schema = mongoose.Schema

const templateSubFolder = new schema({
  subFolderName:{
    type:String,
    require:true,
    unique:true
  },
})

module.exports = mongoose.model("templateSubFolder", templateSubFolder);
