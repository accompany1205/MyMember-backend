const express = require("express");
const router = express.Router();
const { list_folders, create_folder, list_template, update_folder, delete_folder } = require("../../../../controllers/email_nurturing_folder")
const { requireSignin, isAdmin } = require("../../../../controllers/auth");

router.get("/admin/email_nurturing/list_all_folder/:adminId", isAdmin, list_folders)
router.get("/admin/email_nurturing/list_template/:adminId/:folderId", isAdmin, list_template)
router.post("/admin/email_nurturing/create_folder/:adminId/:catId", isAdmin, create_folder)
router.put("/admin/email_nurturing/update_folder/:adminId/:folderId", isAdmin, update_folder)
router.delete("/admin/email_nurturing/delete_folder/:adminId/:folderId", isAdmin, delete_folder)

module.exports = router;