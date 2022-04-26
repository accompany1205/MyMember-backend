const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require("../../../controllers/auth");
const { getadminFolders, createfolder, editFolder,updateCredit, addCredits,  removeFolder, createSubFolder, editSubFolder, removeSubFolder, templateList, templateUpload, templateRemove,
  editTemplate
} = require("../../../controllers/text_template_controller")

router.post("/admin/addCredit/:adminId/:userId", isAdmin, addCredits);
router.put("/admin/addCredit/:adminId/:userId/:creditHistoryId", isAdmin, updateCredit);
router.get("/admin/template_folder/read_folder/:adminId", isAdmin, getadminFolders)
router.post("/admin/template_folder/create_folder/:adminId", isAdmin, createfolder)
router.put("/admin/template_folder/edit_folder/:adminId/:docfolderId", isAdmin, editFolder)
router.delete("/admin/template_folder/delete_folder/:adminId/:docfolderId", isAdmin, removeFolder)
router.get("/admin/template_subfolder/list_template/:adminId/:subfolderId", isAdmin, templateList)
router.post("/admin/template_subfolder/create_subfolder/:adminId/:folderId", isAdmin, createSubFolder)
router.put("/admin/template_subfolder/edit_subfolder/:adminId/:subfolderId", isAdmin, editSubFolder)
router.delete("/admin/template_subfolder/remove_subfolder/:adminId/:subfolderId", isAdmin, removeSubFolder)
router.post("/admin/upload_template/:adminId/:rootFolderId/:subFolderId", isAdmin, templateUpload)
router.put("/admin/upload_template/edit_template/:adminId/:templateId", isAdmin, editTemplate)
router.delete("/admin/upload_template/remove_template/:adminId/:templateId", isAdmin, templateRemove)

module.exports = router
