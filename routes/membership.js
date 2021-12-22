const express = require('express');
const router = express.Router();
const { create,read,membershipInfo,remove,membershipUpdate,membershipStatus,invoice_listing} = require ('../controllers/membership')
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const upload = require('../handler/multer')

router.get('/membership/membership_list/:userId',verifySchool,read)
router.get('/membership/info_membership/:userId/:membershipId',requireSignin,membershipInfo)
router.post('/membership/add_membership/:userId/:folderId',verifySchool,upload.single('membership_profile'),create)
router.delete('/membership/delete_membership/:userId/:membershipId',requireSignin,remove)
router.put('/membership/update_membership/:userId/:membershipId',requireSignin,upload.single('membership_profile'),membershipUpdate)

module.exports = router;