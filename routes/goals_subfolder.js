const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { create_SubFolder, update_SubFolder, delete_SubFolder, } = require("../controllers/goals_subfolder")

// router.get("/goals_subfolder/list_document/:userId/:subfolderId", verifySchool, documentList)
router.post("/goals_subfolder/create_subfolder/:userId/:folderId", verifySchool, create_SubFolder)
router.put("/goals_subfolder/update_subfolder/:userId/:subfolderId", verifySchool, update_SubFolder)
router.delete("/goals_subfolder/delete_subfolder/:userId/:subfolderId", verifySchool, delete_SubFolder)

module.exports = router