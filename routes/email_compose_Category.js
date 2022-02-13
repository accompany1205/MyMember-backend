const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { category_list, addCategory, updateCategory, removeCategory, userEmailList } = require("../controllers/email_compose_Category")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get("/user_email_id_list/:userId", verifySchool, userEmailList)

router.get("/email_compose/category_list/:userId", verifySchool, category_list)
router.post("/email_compose/addCategory/:userId", verifySchool, addCategory);
router.put("/email_compose/edit_category/:userId/:categoryId", verifySchool, updateCategory);
router.delete("/email_compose/remove_category/:userId/:categoryId", verifySchool, removeCategory);

module.exports = router;