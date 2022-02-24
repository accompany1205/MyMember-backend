const express = require('express');
const router = express.Router();
const { get_after_camp, create_after_camp, remove_after_camp, Update_after_camp } = require('../../../controllers/after_camp.js')
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

router.get('/admin/after_camp/get_all_after_camp/:adminId', isAdmin, get_after_camp)
router.post('/admin/after_camp/create_after_camp/:adminId', isAdmin, create_after_camp)
router.delete('/admin/after_camp/delete_after_camp/:adminId/:after_campId', isAdmin, remove_after_camp)
router.put('/admin/after_camp/update_after_camp/:adminId/:after_campId', isAdmin, Update_after_camp)

module.exports = router;    