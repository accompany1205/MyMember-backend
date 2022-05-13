const express = require('express');
const router = express.Router();
const {
	getAllProgram,
	getStateByType,
	getJoinDataByYear,
	getRanksByProgram,
	getMemberByProgram,
	getRanksReportByProgram,
	statisticsFilter
} = require('../controllers/statictics');
const { requireSignin } = require('../controllers/auth');
router.get('/statictics/all-program/:userId', requireSignin, getAllProgram);
router.get('/statictics/state-by-type/:userId', requireSignin, getStateByType);
router.post('/statictics/graphFetch/:userId', requireSignin, statisticsFilter);
router.get(
	'/statictics/yearly-join-quit-data/:userId',
	requireSignin,
	getJoinDataByYear
);
router.get(
	'/statictics/get-ranks-by-program/:userId',
	requireSignin,
	getRanksByProgram
);
router.get(
	'/statictics/get-ranks-report-by-program/:userId',
	requireSignin,
	getRanksReportByProgram
);
router.get(
	'/statictics/get-member-by-program/:userId',
	requireSignin,
	getMemberByProgram
);
module.exports = router;
