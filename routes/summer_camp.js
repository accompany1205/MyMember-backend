const express = require('express');
const router = express.Router();
const {get_summer_camp,create_summer_camp,remove_summer_camp,Update_summer_camp} = require ('../controllers/summer_camp.js')
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get('/summer_camp/get_all_summer_camp/:userId',verifySchool,get_summer_camp)
router.post('/summer_camp/create_summer_camp/:userId',verifySchool,create_summer_camp)
router.delete('/summer_camp/delete_summer_camp/:userId/:summer_campId',requireSignin,remove_summer_camp)
router.put('/summer_camp/update_summer_camp/:userId/:summer_campId',requireSignin,Update_summer_camp)

module.exports = router;    