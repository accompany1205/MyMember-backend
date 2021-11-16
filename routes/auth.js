const express = require("express");
const router = express.Router();
const {
    signup,
    signin,
    signout,
    forgetpasaword,
    resetPassword,
    requireSignin,
    activation,
    get_navbar,
    edit_navbar_li,
    edit_navbar_ui,
    isAdmin,
    approveUserRequestByAdmin,
    updateUser,
    school_listing,
    searchUser,
    adminApproval
} = require("../controllers/auth");
const { userSignupValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
// router.post("/email_activation",activation)
router.post("/signin", signin);
router.post("/signout", signout);
router.put("/forgetPassword", forgetpasaword);
router.put("/resetPassword", resetPassword);
router.put("/get_user_approved_by_admin/:adminId/:userId",isAdmin, approveUserRequestByAdmin);

//
router.put("/updateUser/:userId",updateUser)
router.get("/searchUser/:userId",searchUser)
router.post("/adminApproval", adminApproval)

router.get("/get_navbar", get_navbar);
router.post("/edit_navbar_li", edit_navbar_li);
router.post("/edit_navbar_ui", edit_navbar_ui)
router.get("/school_listing/:page_no",school_listing)
module.exports = router;
