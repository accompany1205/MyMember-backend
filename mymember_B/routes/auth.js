const express = require("express");
const router = express.Router();
const {
    signup,
    signin,
    signout,
    forgetpasaword,
    resetPassword,
    requireSignin,
    activation
} = require("../controllers/auth");
const { userSignupValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
// router.post("/email_activation",activation)
router.post("/signin", signin);
router.post("/signout", signout);
router.put("/forgetPassword", forgetpasaword);
router.put("/resetPassword", resetPassword);

module.exports = router;
