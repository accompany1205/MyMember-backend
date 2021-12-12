const express = require('express');
const router = express.Router();
const {get_leads,create_leads,remove_leads,Update_leads} = require ('../controllers/leads_tracking')
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get('/leads_tracking/get_all_leads/:userId',verifySchool,get_leads)
router.post('/leads_tracking/create_leads/:userId',verifySchool,create_leads)
router.delete('/leads_tracking/delete_leads/:userId/:leadsId',requireSignin,remove_leads)
router.put('/leads_tracking/update_leads/:userId/:leadsId',requireSignin,Update_leads)

module.exports = router;