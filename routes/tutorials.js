const express = require('express');
const router = express.Router();
const { create, read, tutorialInfo, remove, tutorialUpdate } = require('../controllers/tutorials')
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get('/tutorial/tutorial_list/:userId', verifySchool, read)
router.get('/tutorial/info_tutorial/:userId/:tutorialId', requireSignin, tutorialInfo)
router.post('/tutorial/add_tutorial/:userId/:subfolderId', verifySchool, create)
router.put('/tutorial/update_tutorial/:userId/:tutorialId', verifySchool, tutorialUpdate)
router.delete('/tutorial/delete_tutorial/:userId/:tutorialId', verifySchool, remove)

module.exports = router;