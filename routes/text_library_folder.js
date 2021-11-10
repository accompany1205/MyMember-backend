const express = require("express");
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { create_folder,update_folder,delete_folder } = require("../controllers/text_library_folder")

router.post("/text_library/create_folder/:userId/:catId",verifySchool,create_folder)
router.put("/text_library/update_folder/:userId/:folderId",requireSignin,update_folder)
router.delete("/text_library/delete_folder/:userId/:folderId",requireSignin,delete_folder)

module.exports = router;