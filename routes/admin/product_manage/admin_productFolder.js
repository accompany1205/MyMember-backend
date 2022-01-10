const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../../controllers/auth")
const { getadminproductFolder, createproductFolder, updateproductFolder, deleteproductFolder } = require("../../../controllers/productFolder")

router.get("/admin/product/folder_list/:adminId", isAdmin, getadminproductFolder);
router.post("/admin/product/createFolder/:adminId", isAdmin, createproductFolder);
router.put("/admin/product/update_Folder/:adminId/:folderId", isAdmin, updateproductFolder);
router.delete("/admin/product/delete_Folder/:adminId/:folderId", isAdmin, deleteproductFolder);




module.exports = router;