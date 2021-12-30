const express = require('express');
const router = express.Router();
const {get_speciality_program1,create_speciality_program1,remove_speciality_program1,Update_speciality_program1} = require ('../controllers/speciality_program1.js')
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get('/speciality_program1/get_all_speciality_program1/:userId',verifySchool,get_speciality_program1)
router.post('/speciality_program1/create_speciality_program1/:userId',verifySchool,create_speciality_program1)
router.delete('/speciality_program1/delete_speciality_program1/:userId/:speciality_program1Id',requireSignin,remove_speciality_program1)
router.put('/speciality_program1/update_speciality_program1/:userId/:speciality_program1Id',requireSignin,Update_speciality_program1)

module.exports = router;    