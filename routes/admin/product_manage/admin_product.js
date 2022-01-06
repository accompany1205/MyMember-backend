const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../../controllers/auth")
const upload = require('../../../handler/multer');
const { create, read, product_info, deleteproduct, updateproduct, } = require('../../../controllers/product')
// const { assign_product } = require('../../../controllers/admin/product_management/admin_product')
router.get('/admin/product/product_list/:adminId', isAdmin, read)
router.get('/admin/product/info_product/:adminId/:productId', isAdmin, product_info)
router.post('/admin/product/add_product/:adminId/:folderId', upload.array('attach'), isAdmin, create)
// router.post('/admin/product/assign_product/:adminId/:userId/:folderId', isAdmin, create)
router.delete('/admin/product/delete_product/:adminId/:productId', isAdmin, deleteproduct)
router.put('/admin/product/update_product/:adminId/:productId', upload.array('attach'), isAdmin, updateproduct)

module.exports = router;    