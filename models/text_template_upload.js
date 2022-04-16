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
  },
  rootFolderId: {
    type: String,
  },
  userId: {
    type: String,
  },
  adminId: {
    type: String,
  }
})

module.exports = mongoose.model("templateUpload", templateUpload);

