const express = require('express');
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { readfolder,createfolder,editFolder,removeFolder } = require("../controllers/task_folder")

router.get("/task_folder/read_folder/:userId",verifySchool,readfolder)
router.post("/task_folder/create_folder/:userId",verifySchool,createfolder)
router.put("/task_folder/edit_folder/:userId/:docfolderId",requireSignin,editFolder)
router.delete("/task_folder/delete_folder/:userId/:docfolderId",requireSignin,removeFolder)

module.exports = router