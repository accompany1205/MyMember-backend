const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    roomId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    schoolId: {
      type: String,
      required: true
    },
    chatURL: String,
    timestamp: {
      type: Date,
      required: true
    }
  }
)

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
