const express = require('express');
const router = express.Router();
const {get_after_camp,create_after_camp,remove_after_camp,Update_after_camp} = require ('../controllers/after_camp.js')
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get('/after_camp/get_all_after_camp/:userId',verifySchool,get_after_camp)
router.post('/after_camp/create_after_camp/:userId',verifySchool,create_after_camp)
router.delete('/after_camp/delete_after_camp/:userId/:after_campId',requireSignin,remove_after_camp)
router.put('/after_camp/update_after_camp/:userId/:after_campId',requireSignin,Update_after_camp)

module.exports = router;    