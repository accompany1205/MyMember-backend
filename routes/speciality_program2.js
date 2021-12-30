const express = require('express');
const router = express.Router();
const {get_speciality_program2,create_speciality_program2,remove_speciality_program2,Update_speciality_program2} = require ('../controllers/speciality_program2.js')
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get('/speciality_program2/get_all_speciality_program2/:userId',verifySchool,get_speciality_program2)
router.post('/speciality_program2/create_speciality_program2/:userId',verifySchool,create_speciality_program2)
router.delete('/speciality_program2/delete_speciality_program2/:userId/:speciality_program2Id',requireSignin,remove_speciality_program2)
router.put('/speciality_program2/update_speciality_program2/:userId/:speciality_program2Id',requireSignin,Update_speciality_program2)

module.exports = router;    