const express = require("express");
const router = express.Router();
const { create_folder, list_template, update_folder, delete_folder } = require("../controllers/email_nurturing_folder")
const { list_folders, requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get("/email_nurturing/list_all_folder/:userId", verifySchool, list_folders)
router.get("/email_nurturing/list_template/:userId/:folderId", verifySchool, list_template)
router.post("/email_nurturing/create_folder/:userId/:catId", verifySchool, create_folder)
router.put("/email_nurturing/update_folder/:userId/:folderId", requireSignin, update_folder)
router.delete("/email_nurturing/delete_folder/:userId/:folderId", requireSignin, delete_folder)

module.exports = router;