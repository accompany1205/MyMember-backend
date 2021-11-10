const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../controllers/auth")
const { create_user,user_List,school_list,update_user_by_admin, manage_Status,remove,update_user,userInfo } = require("../../controllers/admin/manage_user");
const upload = require('../../handler/multer');

router.get("/admin/user_list/:adminId",isAdmin,user_List);
router.get("/admin/school_list/:adminId",isAdmin,school_list);
router.get("/admin/user_info/:adminId/:userId",isAdmin,userInfo)
router.post("/admin/user_create/:adminId",upload.single('logo'),isAdmin,create_user)
router.put("/admin/manage_status/:adminId/:userId",isAdmin,manage_Status);
router.delete("/admin/remove_user/:adminId/:userId",isAdmin,remove);
router.put("/admin/update_user/:adminId/:userId",isAdmin,upload.single('logo'),update_user)
router.put("/admin/update_user_by_admin/:adminId/:userId",isAdmin,update_user_by_admin)

module.exports = router;