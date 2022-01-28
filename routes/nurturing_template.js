const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { add_template,list_template,remove_template,status_update_template,update_template,single_tem_update_status ,all_email_list,swapAndUpdate_template,multipal_temp_remove} = require("../controllers/nurturing_template")

router.get("/email_nurturing/list_template/:userId/:folderId",verifySchool,list_template)
router.get("/email_nurturing/Alltemplate/:userId",verifySchool,all_email_list)
router.post("/email_nurturing/add_template/:userId/:folderId",verifySchool,upload.array('attachments'),add_template) //add Templete
router.put("/email_nurturing/swap_templete/:userId",requireSignin,swapAndUpdate_template)
router.put("/email_nurturing/update_template/:userId/:templateId",verifySchool,upload.array('attachments'),update_template) //update Templete
router.put("/email_nurturing/single_template_status_change/:userId/:tempId",verifySchool,single_tem_update_status) //single template status update
router.put("/email_nurturing/update_template_status/:userId/:folderId",verifySchool,status_update_template)// all template status change
router.delete("/email_nurturing/remove_template/:userId/:templateId",requireSignin,remove_template)
router.delete("/email_nurturing/multipal_remove_template/:userId/:folderId",verifySchool,multipal_temp_remove)

module.exports = router;