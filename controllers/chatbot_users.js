const ChatUser = require("../models/chat_user")

exports.chatbotUsers = async (req, res) => {
  try {
    const chatbotUsers = await ChatUser.find();
    res.send({ data: chatbotUsers, success: true });
  } catch(err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false })
  }
};
