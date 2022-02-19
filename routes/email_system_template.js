const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { isAdmin, verifySchool } = require("../controllers/auth")
const { add_template, update_template, remove_template, status_update_template, single_temp_update_status, swapAndUpdate_template, multipal_temp_remove } = require("../controllers/email_system_template")


router.post("/email_system/add_template/:userId/:folderId", verifySchool, upload.array('attachments'), add_template)
router.put("/email_system/update_template/:userId/:templateId", verifySchool, upload.array('attachments'), update_template)
router.delete("/email_system/remove_template/:userId/:templateId", verifySchool, remove_template)
router.delete("/email_system/multipal_remove_template/:userId/:folderId", verifySchool, multipal_temp_remove)


router.put("/email_system/drag_drop_templete/:userId", verifySchool, swapAndUpdate_template) //dragAndDrop
router.put("/email_system/update_template_status/:userId/:folderId", verifySchool, status_update_template)
router.put("/email_system/single_marks_as_startemplate_status_change/:userId/:tempId", verifySchool, single_temp_update_status)//single template status change



module.exports = router;