const mongoose = require("mongoose");
const schema = mongoose.Schema

const templateUpload = new schema({
  text: {
    type: String,
  },
  template_name: {
    type: String,
  },
  subFolderId: {
    type: String,
    index:true
  },
  rootFolderId: {
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

module.exports = mongoose.model("templateUpload", templateUpload);

