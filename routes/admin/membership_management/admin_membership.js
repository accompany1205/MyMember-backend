const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../../controllers/auth")
const upload = require('../../../handler/multer')
const { create, read, membershipInfo, remove, membershipUpdate, membershipStatus, invoice_listing } = require('../../../controllers/membership')
// const { assign_membership } = require('../../../controllers/admin/membership_management/admin_membership')
router.get('/admin/membership/membership_list/:adminId', isAdmin, read)
router.get('/admin/membership/info_membership/:adminId/:membershipId', isAdmin, membershipInfo)
router.post('/admin/membership/add_membership/:adminId/:folderId', upload.single('docs'), isAdmin, create)
// router.post('/admin/membership/assign_membership/:adminId/:userId/:folderId', isAdmin, create)
router.delete('/admin/membership/delete_membership/:adminId/:membershipId', isAdmin, remove)
router.put('/admin/membership/update_membership/:adminId/:membershipId', upload.single('docs'), isAdmin, membershipUpdate)

module.exports = router;