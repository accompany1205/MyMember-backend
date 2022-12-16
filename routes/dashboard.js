const express = require('express');
const router = express.Router();
const {
	getSalesStaticTics,
	getDateRangePaymentDue,
	getStudentCountData,
	active_trial_this_month,
	active_trial_all_time,
	leads_this_month,
	leads_all_time,
	member_list_this_month,
	member_list_all_time,
	birthday_this_month,
	birthday_all_time,
	expiredMembership,
	allMemberships,
	TodayTasks,
	ThisWeekTask,
	memberByMembershipType,
} = require('../controllers/dashboard');
// const upload = require('../handler/multer');

const { requireSignin } = require('../controllers/auth');

router.get('/dashboard/sales/:userId', requireSignin, getSalesStaticTics);
router.get(
	'/dashboard/payment-due-states/:userId',
	requireSignin,
	getDateRangePaymentDue
);

// router.get(
// 	'/dashboard/payment-due-states/:userId',
// 	requireSignin,
// 	getDateRangePaymentDue
// );

router.get(
	'/dashboard/student-count/:userId',
	requireSignin,
	getStudentCountData
);
router.get(
	'/dashboard2/this-month-active-trial/:userId/:page_no/:per_page',
	requireSignin,
	active_trial_this_month
);
router.get(
	'/dashboard2/all-time-active-trial/:userId/:page_no/:per_page',
	requireSignin,
	active_trial_all_time
);

/// Leads

router.get(
	'/dashboard2/this-month-leads/:userId/:page_no/:per_page',
	requireSignin,
	leads_this_month
);
router.get(
	'/dashboard2/all-time-leads/:userId/:page_no/:per_page',
	requireSignin,
	leads_all_time
);

// Latest Member

router.get(
	'/dashboard2/this-month-latest-mmember/:userId/:page_no/:per_page',
	requireSignin,
	member_list_this_month
);
router.get(
	'/dashboard2/all-time-mmember/:userId/:page_no/:per_page',
	requireSignin,
	member_list_all_time
);

//
//

router.get(
	'/dashboard2/this-month-birthday/:userId/:page_no/:per_page',
	requireSignin,
	birthday_this_month
);
router.get(
	'/dashboard2/all-time-birthday/:userId/:page_no/:per_page',
	requireSignin,
	birthday_all_time
);

// Get Memberships
router.get(
	'/dashboard2/expired-this-month-membership/:userId/:page_no/:per_page',
	requireSignin,
	expiredMembership
);
router.get(
	'/dashboard2/all-expired-memberships/:userId/:page_no/:per_page',
	requireSignin,
	allMemberships
);

// Get Tasks
router.get(
	'/dashboard2/today-task/:userId/:page_no/:per_page',
	requireSignin,
	TodayTasks
);
router.get(
	'/dashboard2/all-tasks/:userId/:page_no/:per_page',
	requireSignin,
	ThisWeekTask
);

router.get(
	'/dashboard2/members-by-membership-type/:type/:userId/:page_no/:per_page',
	requireSignin,
	memberByMembershipType
);

module.exports = router;
