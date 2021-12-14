const express = require('express');
const router = express.Router();
const { verifySchool } = require("../controllers/auth");
const {
  addTextContact,
  sendTextMessage,
  getTextContacts,
  getTextMessages,
} = require("../controllers/text_chat_controller");

router.post("text-chat/add-contact", verifySchool, addTextContact);
router.post("text-chat/send-message", verifySchool, sendTextMessage);
router.get("text-chat/get-contacts/:userId", verifySchool, getTextContacts);
router.get("text-chat/get-messages/:userId", verifySchool, getTextMessages);

module.exports = router;
