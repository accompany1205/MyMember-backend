const express = require('express');
const router = express.Router();
const { get_smart_list, create_smart_list, update_smart_list, delete_smart_list } = require("../controllers/smartlists");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get('/smartlists/get_all_smartlists/:userId', verifySchool, get_smart_list)
router.post('/smartlists/create_smartlist/:userId/:folderId', verifySchool, create_smart_list)
router.put('/smartlists/update_smartlist/:userId/:slId', verifySchool, update_smart_list)
router.delete('/smartlists/delete_smartlist/:userId/:slId', verifySchool, delete_smart_list)

module.exports = router;