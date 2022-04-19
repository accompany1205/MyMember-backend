const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { readfolder, createfolder, editFolder, removeFolder } = require("../controllers/goals_folder")

router.get("/goals_folder/read_folder/:userId", verifySchool, readfolder)
router.post("/goals_folder/create_folder/:userId", verifySchool, createfolder)
router.put("/goals_folder/update_folder/:userId/:folderId", verifySchool, editFolder)
router.delete("/goals_folder/delete_folder/:userId/:folderId", verifySchool, removeFolder)

module.exports = router