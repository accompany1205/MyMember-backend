const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { add_template, list_template, remove_template, all_email_list, update_template, single_temp_update_status, status_update_template, multipal_temp_remove, getData, swapAndUpdate_template, isFavorite, allSent, allScheduledListing, sendVerificationMail, criteria_met } = require("../controllers/compose_template");


router.get("/all_sent/:userId", verifySchool, allSent)
router.get("/all_email_list/:userId", verifySchool, all_email_list)
router.get("/all_email_list_of_Favorite/:userId", verifySchool, isFavorite)
router.get("/scheduleListing/:userId", verifySchool, allScheduledListing)
