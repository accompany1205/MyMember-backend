const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../controllers/auth")
const { add_template, list_template, update_template, remove_template, status_update_template, single_temp_update_status, swapAndUpdate_template } = require("../../controllers/admin/email_system_template")

router.get("/email_system/list_template/:adminId/:folderId", isAdmin, list_template)

router.post("/email_system/add_template/:adminId/:folderId", isAdmin, add_template)

router.put("/email_system/update_template/:adminId/:templateId", isAdmin, update_template)
router.put("/email_compose/drag_drop_templete/:adminId", isAdmin, swapAndUpdate_template) //dragAndDrop
router.put("/email_system/update_template_status/:adminId/:folderId", isAdmin, status_update_template)
router.put("/email_system/single_template_status_change/:adminId/:tempId", isAdmin, single_temp_update_status)//single template status change

router.delete("/email_system/remove_template/:adminId/:templateId", isAdmin, remove_template)

module.exports = router;