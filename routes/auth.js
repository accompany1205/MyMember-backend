const express = require('express');
const router = express.Router();
const {
	signup,
	signin,
	signout,
	forgetpasaword,
	resetPassword,
	requireSignin,
	activation,
	get_navbar,
	edit_navbar_li,
	edit_navbar_ui,
	isAdmin,
	approveUserRequestByAdmin,
	updateUser,
	school_listing,
	searchUser,
	approvesendgridverification,
	adminApproval,
	unverifiedsendgriduserlist,
	sendOTP_to_email,
	verify_otp,
	createLocations,
	access_school,
	addTwillioNumber
} = require('../controllers/auth');
const { userSignupValidator } = require('../validator');

router.post('/signup', userSignupValidator, signup);
router.post('/new_ocation', createLocations);
// router.post("/email_activation",activation)
router.post('/signin', signin);
router.post('/signout', signout);
router.put('/forgetPassword', forgetpasaword);
router.put('/resetPassword', resetPassword);
router.put(
	'/get_user_approved_by_admin/:adminId/:userId',
	isAdmin,
	approveUserRequestByAdmin
);

router.put('/addtwilllio/:adminId/:userId',isAdmin, addTwillioNumber);
//verfications
router.post('/sendOTP_to_email', sendOTP_to_email);
router.post('/verify_otp', verify_otp);
//
router.put('/updateUser/:userId', updateUser);
router.get('/admin/searchUser/:userId', searchUser);
router.post('/adminApproval', adminApproval);

router.get('/get_navbar', get_navbar);
router.post('/edit_navbar_li', edit_navbar_li);
router.post('/edit_navbar_ui', edit_navbar_ui);
router.get('/admin/school_listing/:adminId', isAdmin, school_listing);
router.put(
	'/approvesendgridverification/:adminId/:userId',
	isAdmin,
	approvesendgridverification
);
router.get(
	'/unverifiedsendgriduserlist/:adminId',
	isAdmin,
	unverifiedsendgriduserlist
);
module.exports = router;
