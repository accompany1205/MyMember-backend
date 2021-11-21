const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { category_list,sendEmail,addCategory,updateCategory,removeCategory,smartList,tempList,userEmailList }  = require("../controllers/email_compose_Category")
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get("/user_email_id_list/:userId",verifySchool,userEmailList)
router.get("/email_compose/temp_list/:userId",verifySchool,tempList)
router.get("/email_compose/smart_list/:userId",verifySchool,smartList)
router.post("/email_compose/send_email/:userId",verifySchool,upload.array('attachments'),sendEmail);


router.get("/email_compose/category_list/:userId",verifySchool,category_list)
router.post("/email_compose/addCategory/:userId",verifySchool,addCategory);
router.put("/email_compose/edit_category/:userId/:categoryId",requireSignin,updateCategory);
router.delete("/email_compose/remove_category/:userId/:categoryId",requireSignin,removeCategory);

module.exports = router;