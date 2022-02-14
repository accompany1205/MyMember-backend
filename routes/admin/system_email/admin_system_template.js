const express = require("express");
const router = express.Router();
const upload = require('../../../handler/multer');
const { isAdmin, verifySchool } = require("../../../controllers/auth")
const { add_template, update_template, remove_template, status_update_template, single_temp_update_status, swapAndUpdate_template, multipal_temp_remove } = require("../../../controllers/email_system_template")


router.post("/admin//email_system/add_template/:adminId/:folderId", verifySchool, upload.array('attachments'), add_template)
router.put("/admin//email_system/update_template/:adminId/:templateId", verifySchool, upload.array('attachments'), update_template)
router.put("/admin//email_system/drag_drop_templete/:adminId", verifySchool, swapAndUpdate_template) //dragAndDrop
router.put("/admin//email_system/update_template_status/:adminId/:folderId", isAdmin, status_update_template)
router.put("/admin//email_system/single_template_status_change/:adminId/:tempId", isAdmin, single_temp_update_status)//single template status change

router.delete("/admin//email_system/remove_template/:adminId/:templateId", verifySchool, remove_template)
router.delete("/admin//email_system/multipal_remove_template/:adminId/:folderId", verifySchool, multipal_temp_remove)


module.exports = router;