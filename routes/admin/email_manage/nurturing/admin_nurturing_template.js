const express = require("express");
const router = express.Router();
const upload = require('../../../../handler/multer');
const { requireSignin, isAuth, isAdmin } = require("../../../../controllers/auth");
const { add_template, remove_template, status_update_template, update_template, single_tem_update_status, all_email_list, swap_template, multipal_temp_remove } = require("../../../../controllers/nurturing_template")

router.get("/admin/email_nurturing/Alltemplate/:adminId", isAdmin, all_email_list)

//template
router.post("/admin/email_nurturing/add_template/:adminId/:folderId", isAdmin, upload.array('attachments'), add_template) //add Templete
router.put("/admin/email_nurturing/update_template/:adminId/:templateId", isAdmin, upload.array('attachments'), update_template) //update Templete
router.delete("/admin/email_nurturing/remove_template/:adminId/:templateId", isAdmin, remove_template)
router.delete("/admin/email_nurturing/multipal_remove_template/:adminId/:folderId", isAdmin, multipal_temp_remove)


router.put("/admin/email_nurturing/swap_templete/:adminId/:templateId", isAdmin, swap_template)
router.put("/admin/email_nurturing/marks_as_star/:adminId/:tempId", isAdmin, single_tem_update_status) //single template status update

module.exports = router;