const express = require("express");
const router = express.Router();
const todos = require("../controllers/todo")
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");

router.get("/list_of_task/:userId",verifySchool,todos.taskread);
router.post("/add_task/:userId",requireSignin,verifySchool,todos.todoCreate);
router.put("/update_task/:userId/:todoId",requireSignin,verifySchool,todos.update);
router.get("/todo_info/:userId/:todoId",requireSignin,verifySchool,todos.taskinfo);
router.delete("/delete_task/:userId/:todoId",requireSignin,verifySchool,todos.remove);


//akash not_completed_taskread
router.get("/today_taskread/:userId",verifySchool,todos.today_taskread)
router.get("/tomorrow_taskread/:userId",verifySchool,todos.tomorrow_taskread)
router.get("/completed_taskread/:userId",verifySchool,todos.completed_taskread)
router.get("/not_completed_taskread/:userId",verifySchool,todos.not_completed_taskread)

module.exports = router;
