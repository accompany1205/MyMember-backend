const express = require("express");
const router = express.Router();
const manage_stripe = require("../controllers/stripe")
const { requireSignin, isAuth } = require("../controllers/auth");
const upload = require('../handler/multer')

router.get("/stripe_info/:userId/:stripeId",requireSignin,manage_stripe.manage_stripe_detail);
router.post("/add_stripe/:userId",requireSignin,upload.single('stripe_image'),manage_stripe.create);
//router.get("/list_of_manage_stripe/:user_id",requireSignin,manage_stripe.read);
router.put("/update_stripe/:userId/:stripeId",requireSignin,upload.single('stripe_image'),manage_stripe.update);
router.delete("/delete_stripe/:userId/:stripeId",requireSignin,manage_stripe.remove);

module.exports = router;
  