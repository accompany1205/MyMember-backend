const express = require('express');
const router = express.Router();
const { get_smart_list, create_smart_list, update_smart_list, delete_smart_list } = require("../../../controllers/smartlists");
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

router.get('/admin/smartlists/get_all_smartlists/:adminId', isAdmin, get_smart_list)
router.post('/admin/smartlists/create_smartlist/:adminId/:folderId', isAdmin, create_smart_list)
router.put('/admin/smartlists/update_smartlist/:adminId/:slId', isAdmin, update_smart_list)
router.delete('/admin/smartlists/delete_smartlist/:adminId/:slId', isAdmin, delete_smart_list)

module.exports = router;