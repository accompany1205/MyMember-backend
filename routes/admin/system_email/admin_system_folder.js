const express = require("express");
const router = express.Router();
const { isAdmin, requireSignin } = require("../../../controllers/auth")
const { create_folder, update_folder, delete_folder ,list_template} = require("../../../controllers/email_system_folder")

router.get("/admin/email_system/list_template/:userId/:folderId", isAdmin, list_template)
router.post("/admin//email_system/create_folder/:adminId/:catId", isAdmin, create_folder)
router.put("/admin//email_system/update_folder/:adminId/:folderId", isAdmin, update_folder)
router.delete("/admin//email_system/delete_folder/:adminId/:folderId", isAdmin, delete_folder)

module.exports = router;