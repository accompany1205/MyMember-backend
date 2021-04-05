const express = require("express");
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { add_template,list_template,remove_template,update_template,status_update_template } = require("../controllers/library_template")

router.get("/email_library/list_template/:userId/:folderId",verifySchool,list_template)
router.post("/email_library/add_template/:userId/:folderId",verifySchool,add_template)
router.put("/email_library/update_template/:userId/:templateId",verifySchool,update_template)
router.put("/email_library/update_template_status/:userId/:folderId",verifySchool,status_update_template)
router.delete("/email_library/remove_template/:userId/:templateId",verifySchool,remove_template)

module.exports = router;