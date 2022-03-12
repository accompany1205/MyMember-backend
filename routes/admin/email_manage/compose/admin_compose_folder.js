const express = require("express");
const router = express.Router();
const { create_folder, list_template, update_folder, delete_folder, list_folders } = require("../../../../controllers/email_compose_folder")
const { requireSignin, isAdmin, verifySchool } = require("../../../../controllers/auth");

router.get("/admin/email_compose/list_all_folder/:adminId", isAdmin, list_folders)
router.get("/admin/email_compose/list_template/:adminId/:folderId", isAdmin, list_template)
router.post("/admin/email_compose/create_folder/:adminId/:catId", isAdmin, create_folder)
router.put("/admin/email_compose/update_folder/:adminId/:folderId", isAdmin, update_folder)
router.delete("/admin/email_compose/delete_folder/:adminId/:folderId", isAdmin, delete_folder)

module.exports = router;