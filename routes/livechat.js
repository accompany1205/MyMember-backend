const express = require('express');
const router = express.Router();
const { getChatHistory, getChannelsByAdminId} = require('../controllers/livechat')

router.get('/livechat/chathistory/:adminId/:machineId', getChatHistory);
router.get('/livechat/channels/:adminId', getChannelsByAdminId);

module.exports = router;