const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../../controllers/auth")
const { getadminFolders, create_folder, update_folder, delete_folder } = require("../../../controllers/membershipFolder")

router.get("/admin/membership/folder_list/:adminId", isAdmin, getadminFolders);
router.post("/admin/membership/createFolder/:adminId", isAdmin, create_folder);
router.put("/admin/membership/update_Folder/:adminId/:folderId", isAdmin, update_folder);
router.delete("/admin/membership/delete_Folder/:adminId/:folderId", isAdmin, delete_folder);




module.exports = router;