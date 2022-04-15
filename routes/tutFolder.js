const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

const { create_folder, update_folder, delete_folder, getFolders } = require("../controllers/tutFolder.js");

router.get("/tutorial/folder_list/:userId", verifySchool, getFolders);
router.post("/tutorial/createFolder/:userId", verifySchool, create_folder);
router.put("/tutorial/update_Folder/:userId/:folderId", verifySchool, update_folder);
router.delete("/tutorial/delete_Folder/:userId/:folderId", verifySchool, delete_folder);




module.exports = router;