const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../../controllers/auth")
const { create, read, productInfo, remove, productUpdate, productStatus, invoice_listing } = require('../../../controllers/product')
const { assign_product } = require('../../../controllers/admin/product_management/admin_product')
router.get('/admin/product/product_list/:adminId', isAdmin, read)
router.get('/admin/product/info_product/:adminId/:productId', isAdmin, productInfo)
router.post('/admin/product/add_product/:adminId/:folderId', isAdmin, create)
router.post('/admin/product/assign_product/:adminId/:userId/:folderId', isAdmin, create)
router.delete('/admin/product/delete_product/:adminId/:productId', isAdmin, remove)
router.put('/admin/product/update_product/:adminId/:productId', isAdmin, productUpdate)

module.exports = router;