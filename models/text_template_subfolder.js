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
  },
  userId: {
    type: String
  },
  adminId: {
    type: String
  }
})

module.exports = mongoose.model("templateSubFolder", templateSubFolder);
