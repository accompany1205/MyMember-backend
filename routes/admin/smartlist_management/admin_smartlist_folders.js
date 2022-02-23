const express = require('express');
const router = express.Router();
const { create_folder, update_folder, delete_folder, getFolders } = require("../../../controllers/smartlist_folder");
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

router.get('/admin/smartlists/folder_list/:adminId', isAdmin, getFolders)
router.post('/admin/smartlists/createFolder/:adminId', isAdmin, create_folder)
router.put('/admin/smartlists/update_Folder/:adminId/:folderId', isAdmin, update_folder)
router.delete('/admin/smartlists/delete_Folder/:adminId/:folderId', isAdmin, delete_folder)

module.exports = router;