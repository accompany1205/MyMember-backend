const express = require('express');
const router = express.Router();
const { fetchAllCC } = require('../controllers/finance_info');
const { requireSignin, isAuth, verifySchool } = require('../controllers/auth');

router.get('/finance/fetch-all-cc/:userId', requireSignin, fetchAllCC);

module.exports = router;
