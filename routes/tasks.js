const express = require('express');
const router = express.Router();
const { Create, read, tasksInfo, remove, tasksUpdate, taskFilter, todayTask,notificationTodayTask,seenTasks, seenRead } = require('../controllers/tasks')
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const upload = require('../handler/multer')

router.post('/tasks/add_tasks/:userId/:subfolderId', verifySchool, Create)
router.post('/tasks/filter/:userId', verifySchool, taskFilter)
router.get('/tasks/today_tasks/:userId', verifySchool, todayTask)
router.put('/tasks/update_tasks/:userId/:taskId', upload.array('docs'), verifySchool, tasksUpdate)
router.delete('/tasks/delete_tasks/:userId/:taskId', verifySchool, remove)
router.get('/tasks/notification_today_tasks/:userId',notificationTodayTask)
router.put('/notification_seen',seenTasks)
router.put('/notification_remove',seenRead)

module.exports = router;