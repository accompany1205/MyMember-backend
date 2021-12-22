const express = require("express");
const router = express.Router();
const { isAdmin, verifySchool, requireSignin } = require("../../controllers/auth")
const { create_folder, update_folder, delete_folder } = require("../../controllers/admin/email_system_folder")

router.post("/email_system/create_folder/:userId/:catId", verifySchool, create_folder)
router.put("/email_system/update_folder/:userId/:folderId", requireSignin, update_folder)
router.delete("/email_system/delete_folder/:userId/:folderId", requireSignin, delete_folder)

module.exports = router;