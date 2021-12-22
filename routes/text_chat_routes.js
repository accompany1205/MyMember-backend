const express = require('express');
const router = express.Router();
const { verifySchool } = require("../controllers/auth");
const {
  addTextContact,
  sendTextMessage,
  seenContactTextMessages,
  pinContact,
  getTextContacts,
  getTextMessages,
  getTextContactsDetails,
  listenIncomingSMS
} = require("../controllers/text_chat_controller");

router.post("/text-chat/add-contact/:userId", verifySchool, addTextContact);
router.post("/text-chat/send-message/:userId", verifySchool, sendTextMessage);
router.post("/text-chat/seen-contact-messages/:contact/:userId", verifySchool, seenContactTextMessages);
router.post("/text-chat/pin-contact/:contact/:userId", verifySchool, pinContact);
router.post("/text-chat/contacts-details/:userId", verifySchool, getTextContactsDetails);
router.get("/text-chat/get-contacts/:userId", verifySchool, getTextContacts);
router.get("/text-chat/get-messages/:userId", verifySchool, getTextMessages);
router.post("/text-chat/listen-message", listenIncomingSMS);

module.exports = router;
