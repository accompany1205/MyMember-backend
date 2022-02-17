const express = require("express");
const router = express.Router();
const { isAdmin, verifySchool, requireSignin } = require("../controllers/auth")
const { list_folders, list_template, create_folder, update_folder, delete_folder } = require("../controllers/email_system_folder")

router.get("/email_system/list_all_folder/:userId", verifySchool, list_folders)
router.post("/email_system/create_folder/:userId/:catId", verifySchool, create_folder)
router.get("/email_system/list_template/:userId/:folderId", verifySchool, list_template)
router.put("/email_system/update_folder/:userId/:folderId", verifySchool, update_folder)
router.delete("/email_system/delete_folder/:userId/:folderId", verifySchool, delete_folder)

module.exports = router;