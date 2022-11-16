const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

const { create_SubFolder, update_SubFolder, delete_SubFolder, getSubFolders } = require("../controllers/tut_subfolder");

// router.get("/tutorial/SubFolder_list/:userId", verifySchool, getSubFolders);
router.post("/tutorial/create_subfolder/:userId/:folderId", verifySchool, create_SubFolder);
router.put("/tutorial/update_subfolder/:userId/:subfolderId", verifySchool, update_SubFolder);
router.delete("/tutorial/delete_subfolder/:userId/:subfolderId", verifySchool, delete_SubFolder);


module.exports = router;