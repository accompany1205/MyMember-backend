const express = require('express');
const router = express.Router();
const {
	getAllProgram,
	getStateByType,
	getJoinDataByYear,
	getRanksByProgram,
	getMemberByProgram,
	getRanksReportByProgram,
} = require('../controllers/statictics');
const { requireSignin, verifySchool } = require('../controllers/auth');
router.get('/statictics/all-program/:userId', requireSignin, getAllProgram);
router.get('/statictics/state-by-type/:userId', requireSignin, getStateByType);
router.get(
	'/statictics/yearly-join-quit-data/:userId',
	requireSignin, verifySchool,
	getJoinDataByYear
);
router.get(
	'/statictics/get-ranks-by-program/:userId',
	requireSignin, verifySchool,
	getRanksByProgram
);
router.get(
	'/statictics/get-ranks-report-by-program/:userId',
	
	getRanksReportByProgram
);
router.get(
	'/statictics/get-member-by-program/:userId',
	requireSignin, verifySchool,
	getMemberByProgram
);
module.exports = router;
