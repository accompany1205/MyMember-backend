const express = require("express");
const router = express.Router();
const { isAdmin,verifySchool } = require("../../controllers/auth")
const { create_user,user_List,school_list,update_user_by_admin, manage_Status,remove,update_user,userInfo ,removeAll,update_user_stripe_info,user_stripe_info,get_user_stripe_info} = require("../../controllers/admin/manage_user");
const upload = require('../../handler/multer');

router.get("/admin/user_list/:adminId",isAdmin,user_List);
router.get("/admin/school_list/:adminId",isAdmin,school_list);
router.get("/admin/user_info/:adminId/:userId",isAdmin,userInfo)
router.post("/admin/user_create/:adminId",upload.single('logo'),isAdmin,create_user)
router.put("/admin/manage_status/:adminId/:userId",isAdmin,manage_Status);
router.delete("/admin/remove_user/:adminId/:userId",isAdmin,remove);
router.delete("/admin/remove_Alluser/:adminId",isAdmin,removeAll);
router.put("/admin/update_user/:adminId/:userId",isAdmin,upload.single('logo'),update_user)
router.put("/admin/update_user_by_admin/:adminId/:userId",isAdmin,update_user_by_admin)
router.put("/admin/update_user_by_admin/stripe/:adminId/:userId", isAdmin,update_user_stripe_info)
router.get("/admin/get_user_by_admin/stripe/:adminId/:userId",isAdmin,get_user_stripe_info)
router.put("/admin/update_user_by_user/stripe/:userId", verifySchool,update_user_stripe_info)
router.get("/admin/get_userData_by_userId/stripe/:userId",verifySchool,user_stripe_info)


module.exports = router;