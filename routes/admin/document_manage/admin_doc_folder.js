const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");
const { getadminFolders, createfolder, editFolder, removeFolder } = require("../../../controllers/doc_folder")

router.get("/admin/document_folder/read_folder/:adminId", isAdmin, getadminFolders)
router.post("/admin/document_folder/create_folder/:adminId", isAdmin, createfolder)
router.put("/admin/document_folder/edit_folder/:adminId/:docfolderId", isAdmin, editFolder)
router.delete("/admin/document_folder/delete_folder/:adminId/:docfolderId", isAdmin, removeFolder)

module.exports = router