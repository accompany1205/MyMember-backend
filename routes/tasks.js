const express = require('express');
const router = express.Router();
const { Create, read, tasksInfo, remove, tasksUpdate, taskFilter } = require('../controllers/tasks')
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.post('/tasks/add_tasks/:userId/:subfolderId', verifySchool, Create)
router.post('/tasks/filter/:userId', verifySchool, taskFilter)
router.put('/tasks/update_tasks/:userId/:taskId', verifySchool, tasksUpdate)
router.delete('/tasks/delete_tasks/:userId/:taskId', verifySchool, remove)

module.exports = router;