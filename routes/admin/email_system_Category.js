const express = require("express");
const router = express.Router();
const upload = require('../../handler/multer');
const { isAdmin,verifySchool } = require("../../controllers/auth")
const { addCategory, updateCategory, removeCategory, category_list, sendEmail, tempList } = require("../../controllers/admin/email_system_Category");

router.get("/email_system/category_list/:userId", verifySchool, category_list)
router.post("/email_system/send_email/:userId", verifySchool,upload.array('attachments'), sendEmail);
router.post("/email_system/addCategory/:userId", verifySchool, addCategory);
router.put("/email_system/edit_category/:userId/:categoryId", verifySchool, updateCategory);
router.delete("/email_system/remove_category/:userId/:categoryId", verifySchool, removeCategory);

module.exports = router;


