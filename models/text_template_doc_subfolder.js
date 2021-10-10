const mongoose = require("mongoose");
const schema = mongoose.Schema

const textTemplateDocSubFolder = new schema({
  subFolderName:{
    type:String,
    require:true,
    unique:true
  },
})

module.exports = mongoose.model("textTemplateDocSubFolder", textTemplateDocSubFolder);
