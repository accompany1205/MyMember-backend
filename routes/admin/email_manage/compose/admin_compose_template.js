const express = require("express");
const router = express.Router();
const upload = require('../../../../handler/multer');
const { requireSignin, isAdmin, verifySchool } = require("../../../../controllers/auth");
const { admin_add_template, list_template, remove_template, update_template, multipal_temp_remove, getData, swapAndUpdate_template, isFavorite, allSent, allScheduledListing, sendVerificationMail, criteria_met } = require("../../../../controllers/compose_template");



router.post("/admin/email_compose/add_template/:adminId/:folderId", isAdmin, upload.array('attachments'), admin_add_template)
router.put("/admin/email_compose/update_template/:adminId/:templateId", isAdmin, upload.array('attachments'), update_template)
router.delete("/admin/email_compose/remove_template/:adminId/:templateId", isAdmin, remove_template)
router.delete("/admin/email_compose/multipal_remove_template/:adminId/:folderId", isAdmin, multipal_temp_remove)

module.exports = router;
