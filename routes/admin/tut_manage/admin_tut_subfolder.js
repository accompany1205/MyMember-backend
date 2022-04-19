const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

const { create_SubFolder, update_SubFolder, delete_SubFolder, getSubFolders } = require("../../../controllers/tut_subfolder");

// router.get("/admin/tutorial/SubFolder_list/:adminId", isAdmin, getSubFolders);
router.post("/admin/tutorial/create_subfolder/:adminId/:folderId", isAdmin, create_SubFolder);
router.put("/admin/tutorial/update_subfolder/:adminId/:subfolderId", isAdmin, update_SubFolder);
router.delete("/admin/tutorial/delete_subfolder/:adminId/:subfolderId", isAdmin, delete_SubFolder);




module.exports = router;