const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");
const { createSubFolder, editSubFolder, removeSubFolder, documentList, subFoldertList } = require("../../../controllers/doc_subfolder")

router.get("/admin/document_subfolder/list_document/:adminId/:subfolderId", isAdmin, subFoldertList)
router.post("/admin/document_subfolder/create_subfolder/:adminId/:folderId", isAdmin, createSubFolder)
router.put("/admin/document_subfolder/edit_subfolder/:adminId/:subfolderId", isAdmin, editSubFolder)
router.delete("/admin/document_subfolder/remove_subfolder/:adminId/:subfolderId", isAdmin, removeSubFolder)

module.exports = router