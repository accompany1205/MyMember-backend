const express = require('express');
const router = express.Router();
const {
	getAllProgram,
	getStateByType,
	getJoinDataByYear,
	getRanksByProgram,
	getMemberByProgram,
	getRanksReportByProgram,
	statisticsFilter,
	statisticsFilterMember,
	leadsFilter,
	getMembershipData,
	allStaticsData
} = require('../controllers/statictics');
const { requireSignin, verifySchool } = require('../controllers/auth');
router.get('/statictics/all-program/:userId', requireSignin, getAllProgram);
router.get('/statictics/state-by-type/:userId', requireSignin, getStateByType);
router.post('/statictics/graphFetch/trials_statics/:userId', requireSignin, statisticsFilter);
router.post('/statictics/graphFetchMember/:userId', requireSignin, statisticsFilterMember);
router.get('/statictics/leadsFilter/:userId/:studentType/:date', requireSignin, leadsFilter);
//leads_tracking/get_all_leads

router.get('/statics/graphFetchStatics/:userId/:staticsType/:year',requireSignin,allStaticsData)


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
	requireSignin, verifySchool,
	getRanksReportByProgram
);
router.get(
	'/statictics/get-member-by-program/:userId',
	requireSignin, verifySchool,
	getMemberByProgram
);



router.get('/statics/get-membership-data/:userId/:membership_type/:year',requireSignin, verifySchool,getMembershipData)

module.exports = router;
