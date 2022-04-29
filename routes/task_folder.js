const express = require('express');
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { readfolder,createfolder,editFolder,removeFolder } = require("../controllers/task_folder")

router.get("/task_folder/read_folder/:userId",verifySchool,readfolder)
router.post("/task_folder/create_folder/:userId",verifySchool,createfolder)
router.put("/task_folder/update_folder/:userId/:folderId",verifySchool,editFolder)
router.delete("/task_folder/delete_folder/:userId/:folderId",verifySchool,removeFolder)

module.exports = router