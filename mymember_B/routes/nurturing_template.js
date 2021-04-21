const express = require("express");
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { add_template,list_template,remove_template,status_update_template,update_template } = require("../controllers/nurturing_template")

router.get("/email_nurturing/list_template/:userId/:folderId",verifySchool,list_template)
router.post("/email_nurturing/add_template/:userId/:folderId",verifySchool,add_template)
router.put("/email_nurturing/update_template/:userId/:templateId",verifySchool,update_template)
router.put("/email_nurturing/update_template_status/:userId/:folderId",verifySchool,status_update_template)
router.delete("/email_nurturing/remove_template/:userId/:templateId",requireSignin,remove_template)

module.exports = router;