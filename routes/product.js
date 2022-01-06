const express = require('express');
const upload = require('../handler/multer');
const router = express.Router();
const { create, product_info, deleteproduct, updateproduct, read, } = require("../controllers/product")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get('/product/product_list/:userId', verifySchool, read);
router.post('/product/create_product/:userId/:folderId', upload.array('attach'), verifySchool, create);
router.get('/product/product_info/:productId', requireSignin, product_info);
router.delete('/product/delete_product/:userId/:productId', requireSignin, deleteproduct);
router.put('/product/update_product/:userId/:productId', upload.array('attach'), requireSignin, updateproduct);

module.exports = router 