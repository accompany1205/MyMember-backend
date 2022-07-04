const express = require("express");
const router = express.Router();
const manage_stripe = require("../../../controllers/candidate_stripe")
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");
const upload = require('../../../handler/multer')

router.get("/admin/stripe_info/:adminId/:stripeId", isAdmin, manage_stripe.manage_stripe_detail);
router.post("/admin/add_stripe/:adminId", isAdmin, upload.single('stripe_image'), manage_stripe.create);
//router.get("/list_of_manage_stripe/:user_id",requireSignin,manage_stripe.read);
router.put("/admin/update_stripe/:adminId/:stripeId", isAdmin, upload.single('stripe_image'), manage_stripe.update);
router.delete("/admin/delete_stripe/:adminId/:stripeId", isAdmin, manage_stripe.remove);

module.exports = router;
