const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { createSubFolder, editSubFolder, removeSubFolder, documentList } = require("../controllers/task_subfolder")

// router.get("/task_subfolder/list_document/:userId/:subfolderId", verifySchool, documentList)
router.post("/task_subfolder/create_subfolder/:userId/:folderId", verifySchool, createSubFolder)
router.put("/task_subfolder/edit_subfolder/:userId/:subfolderId", requireSignin, editSubFolder)
router.delete("/task_subfolder/remove_subfolder/:userId/:subfolderId", requireSignin, removeSubFolder)

module.exports = router