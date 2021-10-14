const mongoose = require("mongoose");
const schema = mongoose.Schema

const templateUpload = new schema({
  template:{
    type:String,
    require:true
  },
  template_name:{
    type:String,
    require:true
  },
  subFolderId:{
    type:String,
    require:true
  },
  rootFolderId:{
    type:String,
    require:true
  }
})

module.exports = mongoose.model("templateUpload", templateUpload);

