const express = require("express");
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { add_template,list_template,remove_template,all_email_list,update_template,status_update_template,multipal_temp_remove } = require("../controllers/compose_template");

router.get("/all_email_list/:userId",verifySchool,all_email_list)
router.get("/email_compose/list_template/:userId/:folderId",verifySchool,list_template)
router.post("/email_compose/add_template/:userId/:folderId",verifySchool,add_template)
router.put("/email_compose/update_template/:userId/:templateId",requireSignin,update_template)
router.put("/email_compose/update_template_status/:userId/:folderId",verifySchool,status_update_template)
router.delete("/email_compose/remove_template/:userId/:templateId",requireSignin,remove_template)
router.delete("/email_compose/multipal_remove_template/:userId",verifySchool,multipal_temp_remove)
    
module.exports = router;