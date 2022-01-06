const express = require("express");
const router = express.Router();


const {
    update,
    remove,
    buy_product,
    product_InfoById,
} = require("../controllers/buy_product");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");



router.get("/product/buy_product_info_Byproduct/:userId/:productID", requireSignin, product_InfoById)
router.post("/product/buy_product/:userId/:studentId", requireSignin, buy_product);
router.put("/product/update_buy_products/:userId/:productId/:type", requireSignin, update);
router.delete("/product/delete_buy_product/:userId/:productId", requireSignin, remove);

module.exports = router;
