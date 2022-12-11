const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { createTicket, updateTicketMessage, getAllTicketsByUserId} = require('../controllers/ticket.controller');

router.post('/ticket/new', createTicket);
router.put('/ticket/:ticketId', requireSignin, updateTicketMessage );
router.get('/ticket/all/:userId', getAllTicketsByUserId);

// TODO: gettickets by status, update ticket message.

module.exports = router;
