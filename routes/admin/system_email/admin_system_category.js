const express = require("express");
const router = express.Router();
const upload = require('../../../handler/multer');
const { isAdmin,verifySchool } = require("../../../controllers/auth")
const { addCategory, updateCategory, removeCategory, admin_category_list, sendEmail, tempList } = require("../../../controllers/email_system_Category");

router.get("/admin/email_system/category_list/:adminId", verifySchool, admin_category_list)
router.post("/admin/email_system/send_email/:adminId", verifySchool,upload.array('attachments'), sendEmail);
router.post("/admin/email_system/addCategory/:adminId", verifySchool, addCategory);
router.put("/admin//email_system/edit_category/:adminId/:categoryId", verifySchool, updateCategory);
router.delete("/admin//email_system/remove_category/:adminId/:categoryId", verifySchool, removeCategory);

module.exports = router;