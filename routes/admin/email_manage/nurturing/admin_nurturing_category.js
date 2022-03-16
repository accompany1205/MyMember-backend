const express = require("express");
const router = express.Router();
const upload = require('../../../../handler/multer');
const { requireSignin, isAdmin, verifySchool } = require("../../../../controllers/auth");
const { admin_category_list, addcategory, updateCategory, removeCategory, tempList, sendEmail, userEmailList } = require("../../../../controllers/email_nurturing_Category")

router.get("/admin/email_nurturing/category_list/:adminId", isAdmin, admin_category_list)
router.post("/admin/email_nurturing/addCategory/:adminId", isAdmin, addcategory)
router.put("/admin/email_nurturing/edit_category/:adminId/:categoryId", isAdmin, updateCategory)
router.delete("/admin/email_nurturing/remove_category/:adminId/:categoryId", isAdmin, removeCategory)

module.exports = router;