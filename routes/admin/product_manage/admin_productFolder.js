const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../../controllers/auth")
const { getFolders, create_folder, update_folder, delete_folder } = require("../../../controllers/productFolder")

router.get("/admin/product/folder_list/:adminId", isAdmin, getFolders);
router.post("/admin/product/createFolder/:adminId", isAdmin, create_folder);
router.put("/admin/product/update_Folder/:adminId/:folderId", isAdmin, update_folder);
router.delete("/admin/product/delete_Folder/:adminId/:folderId", isAdmin, delete_folder);




module.exports = router;