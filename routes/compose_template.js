const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { add_template, remove_template, sendEmail, all_email_list, update_template, single_temp_update_status, status_update_template, multipal_temp_remove, getData, swapAndUpdate_template, isFavorite, allSent, allScheduledListing, sendVerificationMail, criteria_met,activate_mail, sendImageResp } = require("../controllers/compose_template");

router.get("/all_sent/:userId", verifySchool, allSent)
router.get("/all_email_list/:userId", verifySchool, all_email_list)
router.get("/all_email_list_of_Favorite/:userId", verifySchool, isFavorite)
router.get("/scheduleListing/:userId", verifySchool, allScheduledListing)

//composeEmail
router.post("/email/eventManager", upload.array('img'), sendImageResp);
router.post("/email_compose/send_email/:userId", verifySchool, upload.array('attachments'), sendEmail);

//template
router.post("/email_compose/add_template/:userId/:folderId", verifySchool, upload.array('attachments'), add_template)
router.put("/email_compose/update_template/:userId/:templateId", requireSignin, upload.array('attachments'), update_template)
router.delete("/email_compose/remove_template/:userId/:templateId", requireSignin, remove_template)
router.delete("/email_compose/multipal_remove_template/:userId/:folderId", verifySchool, multipal_temp_remove)

router.put("/activate_mail/:userId", requireSignin, verifySchool,activate_mail)
router.put("/email_compose/drag_drop_templete/:userId", requireSignin, verifySchool, swapAndUpdate_template)
router.put("/email_compose/marks_as_star/:userId/:tempId", verifySchool, single_temp_update_status)//single template status change
router.put("/email_compose/update_template_status/:userId/:folderId", verifySchool, status_update_template)//all template status change
router.post("/emailsendgrid/sendverification/:userId", sendVerificationMail)

//met
router.post("/criteria_met/email_compose/add_template/:userId/:folderId", verifySchool, upload.array('attachments'), criteria_met)

router.get('/date_and_time', getData)

module.exports = router;    