const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

const {create_folder,update_folder,delete_folder,getFolders} = require("../controllers/membershipFolder");

router.get("/membership/folder_list/:userId", verifySchool, getFolders);
router.post("/membership/createFolder/:userId", verifySchool, create_folder);
router.put("/membership/update_Folder/:userId/:folderId", verifySchool, update_folder);
router.delete("/membership/delete_Folder/:userId/:folderId", verifySchool, delete_folder    );




module.exports = router;
