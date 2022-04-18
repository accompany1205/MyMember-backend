const express = require('express');
const router = express.Router();
const { create, read, tutorialInfo, remove, tutorialUpdate } = require('../../../controllers/tutorials')
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

router.get('/admin/tutorial/tutorial_list/:adminId', isAdmin, read)
router.get('/admin/tutorial/info_tutorial/:adminId/:tutorialId', requireSignin, tutorialInfo)
router.post('/admin/tutorial/add_tutorial/:adminId/:subfolderId', isAdmin, create)
router.put('/admin/tutorial/update_tutorial/:adminId/:tutorialId', isAdmin, tutorialUpdate)
router.delete('/admin/tutorial/delete_tutorial/:adminId/:tutorialId', isAdmin, remove)

module.exports = router;