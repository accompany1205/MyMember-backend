const express = require("express");
const router = express.Router();
const { isAdmin, verifySchool, requireSignin } = require("../../../controllers/auth")
const { create_folder, update_folder, delete_folder ,list_template} = require("../../../controllers/email_system_folder")

router.get("/admin/email_system/list_template/:userId/:folderId", verifySchool, list_template)
router.post("/admin//email_system/create_folder/:adminId/:catId", verifySchool, create_folder)
router.put("/admin//email_system/update_folder/:adminId/:folderId", requireSignin, update_folder)
router.delete("/admin//email_system/delete_folder/:adminId/:folderId", requireSignin, delete_folder)

module.exports = router;