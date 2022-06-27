const express = require('express');
const router = express.Router();

const { chatbotUsers } = require('../controllers/chatbot_users');

router.get('/chat-users', chatbotUsers);

module.exports = router;
