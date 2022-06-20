const mongoose = require('mongoose');

const ChatUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    // required: true
  },
  roomId: {
    type: String,
    required: true
  },
  schoolId: {
    type: String,
    required: true
  },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  updated: Date
});

const ChatUser = mongoose.model('ChatUser', ChatUserSchema);
module.exports = ChatUser;
