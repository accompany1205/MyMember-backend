const express = require('express');
const router = express.Router();
const { updateStatus, admin_read } = require("../../../controllers/support");
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

router.get('/admin/support/viewticket/:adminId', isAdmin, admin_read)
router.put('/admin/support/update_status/:adminId/:ticketId', isAdmin, updateStatus)

module.exports = router;