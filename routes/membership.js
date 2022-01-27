const express = require('express');
const router = express.Router();
const { create, read, membershipInfo, remove, membershipUpdate, membershipStatus, invoice_listing, mergeDoc } = require('../controllers/membership')
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const upload = require('../handler/multer')

router.get('/membership/membership_list/:userId', verifySchool, read)
router.get('/membership/info_membership/:userId/:membershipId', requireSignin, membershipInfo)
router.post('/membership/add_membership/:userId/:folderId', verifySchool, upload.array('docs'), create)
router.delete('/membership/delete_membership/:userId/:membershipId', requireSignin, remove)
router.put('/membership/update_membership/:userId/:membershipId', requireSignin, upload.fields([{ name: 'thumbnail' }, { name: 'docs' }]), membershipUpdate)
router.post('/membership/mergeDoc/:userId/:studentId/:membershipId/:buyMembershipId', requireSignin, mergeDoc);

module.exports = router;