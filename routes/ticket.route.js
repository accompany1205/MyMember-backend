const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { createTicket, updateTicketMessage, getAllTicketsByUserId, getTicketById, addNewMessage, replyMessage} = require('../controllers/ticket.controller');

router.post('/ticket/new', createTicket);
router.put('/ticket/:ticketId', requireSignin, updateTicketMessage );
router.get('/ticket/all/:userId', getAllTicketsByUserId);
router.get('/ticket/:ticketId', getTicketById);
router.post('/ticket/message', addNewMessage);
router.post('/ticket/reply', replyMessage);

// TODO: gettickets by status, update ticket message.

module.exports = router;
