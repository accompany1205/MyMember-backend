const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { addcategory,category_list,updateCategory,removeCategory ,userEmailList,tempList,sendEmail} = require("../controllers/email_library_Category")


router.post("/email_library/send_email/:userId",verifySchool,upload.array('attachments'),sendEmail);
router.get("/email_library/category_list/:userId",verifySchool,category_list)
router.post("/email_library/addcategory/:userId",verifySchool,addcategory)
router.put("/email_library/edit_category/:userId/:categoryId",requireSignin,updateCategory)
router.delete("/email_library/remove_category/:userId/:categoryId",requireSignin,removeCategory)

module.exports = router