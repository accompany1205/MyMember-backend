const express = require('express');
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { readfolder,createfolder,editFolder,removeFolder,createSubFolder,editSubFolder,removeSubFolder,templateList,templateUpload, templateRemove,
  editTemplate
} = require("../controllers/text_template_controller")

router.get("/template_folder/read_folder/:userId",verifySchool,readfolder)
router.post("/template_folder/create_folder/:userId",verifySchool,createfolder)
router.put("/template_folder/edit_folder/:userId/:docfolderId",requireSignin,editFolder)
router.delete("/template_folder/delete_folder/:userId/:docfolderId",requireSignin,removeFolder)
router.get("/template_subfolder/list_template/:userId/:subfolderId",verifySchool,templateList)
router.post("/template_subfolder/create_subfolder/:userId/:folderId",verifySchool,createSubFolder)
router.put("/template_subfolder/edit_subfolder/:userId/:subfolderId",requireSignin,editSubFolder)
router.delete("/template_subfolder/remove_subfolder/:userId/:subfolderId",requireSignin,removeSubFolder)
router.post("/upload_template/:userId/:rootFolderId/:subFolderId",verifySchool,templateUpload)
router.put("/upload_template/edit_template/:userId/:templateId",requireSignin,editTemplate)
router.delete("/upload_template/remove_template/:userId/:templateId",requireSignin,templateRemove)

module.exports = router
