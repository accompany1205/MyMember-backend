const express = require("express");
const router = express.Router();


const {
    update,
    remove,
    buy_product,
    buy_product_stripe,
    product_InfoById,
} = require("../controllers/buy_product");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");



router.get("/product/buy_product_info_Byproduct/:userId/:productID", requireSignin, verifySchool, product_InfoById)
router.post("/product/buy_product/:userId/:studentId", requireSignin, verifySchool, buy_product);
router.post("/product_stripe/buy_product_stripe/:userId/:studentId", requireSignin, verifySchool, buy_product_stripe);
router.put("/product/update_buy_products/:userId/:productId/:type", requireSignin, verifySchool, update);
router.delete("/product/delete_buy_product/:userId/:productId", requireSignin, verifySchool, remove);

module.exports = router;
