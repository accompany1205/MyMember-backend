const express = require("express");
const router = express.Router();
const { admin_category_list, addCategory, updateCategory, removeCategory, userEmailList } = require("../../../../controllers/email_compose_Category")
const { requireSignin, isAdmin, verifySchool } = require("../../../../controllers/auth");

router.get("/user_email_id_list/:adminId", isAdmin, userEmailList)

router.get("/admin/email_compose/category_list/:adminId", isAdmin, admin_category_list)
router.post("/admin/email_compose/addCategory/:adminId", isAdmin, addCategory);
router.put("/admin/email_compose/edit_category/:adminId/:categoryId", isAdmin, updateCategory);
router.delete("/admin/email_compose/remove_category/:adminId/:categoryId", isAdmin, removeCategory);

module.exports = router;