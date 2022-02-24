const express = require('express');
const router = express.Router();
const { get_adminleads, create_leads, remove_leads, Update_leads } = require('../../../controllers/leads_tracking')
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

router.get('/admin/leads_tracking/get_all_leads/:adminId', isAdmin, get_adminleads)
router.post('/admin/leads_tracking/create_leads/:adminId', isAdmin, create_leads)
router.delete('/admin/leads_tracking/delete_leads/:adminId/:leadsId', requireSignin, remove_leads)
router.put('/admin/leads_tracking/update_leads/:adminId/:leadsId', requireSignin, Update_leads)

module.exports = router;