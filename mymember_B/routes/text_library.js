const express = require("express");
const router = express.Router();
const { addCategory,category_list,updateCategory,removeCategory }  = require("../controllers/text_library")
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get("/text_library/category_list/:userId",verifySchool,category_list)
router.post("/text_library/addCategory/:userId",verifySchool,addCategory)
router.put("/text_library/editCategory/:userId/:categoryId",requireSignin,updateCategory)
router.delete("/text_library/removeCateogry/:userId/:categoryId",requireSignin,removeCategory)

module.exports = router;