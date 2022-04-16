const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../../../controllers/auth");

const { create_folder, update_folder, delete_folder, getadminFolders } = require("../../../controllers/tutFolder.js");

router.get("/admin/tutorial/folder_list/:adminId", isAdmin, getadminFolders);
router.post("/admin/tutorial/createFolder/:adminId", isAdmin, create_folder);
router.put("/admin/tutorial/update_Folder/:adminId/:folderId", isAdmin, update_folder);
router.delete("/admin/tutorial/delete_Folder/:adminId/:folderId", isAdmin, delete_folder);




module.exports = router;