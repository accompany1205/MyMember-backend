const express = require('express');
const router = express.Router();
const { create_folder, update_folder, delete_folder, getFolders } = require("../controllers/smartlist_folder");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get('/smartlists/folder_list/:userId', verifySchool, getFolders)
router.post('/smartlists/createFolder/:userId', verifySchool, create_folder)
router.put('/smartlists/update_Folder/:userId/:folderId', verifySchool, update_folder)
router.delete('/smartlists/delete_Folder/:userId/:folderId', verifySchool, delete_folder)

module.exports = router;