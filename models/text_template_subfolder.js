const mongoose = require("mongoose");
const schema = mongoose.Schema

const templateSubFolder = new schema({
  subFolderName: {
    type: String,
    require: true,
    // unique: true
  },
  template: [{
    type: schema.Types.ObjectId,
    ref: 'templateUpload'
  }],
  folderId: {
    type: String,
    index:true
  },
  userId: {
    type: String,
    index:true
  },
  adminId: {
    type: String,
    index:true
  }
})

module.exports = mongoose.model("templateSubFolder", templateSubFolder);
