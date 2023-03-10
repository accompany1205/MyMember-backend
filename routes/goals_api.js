const express = require("express");
const router = express.Router();
const goals = require("../controllers/goals")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.post("/add_goals/:userId", verifySchool, goals.goalCreate);
router.get("/list_of_goals/:userId", verifySchool, goals.goalread);
router.put("/update_goals/:userId/:goalId", requireSignin, goals.goalupdate);
router.get("/goals_info/:userId/:goalId", requireSignin, goals.goalinfo);
router.delete("/delete_goals/:userId/:goalId", requireSignin, goals.goalremove);


//for dashboard
router.get("/dashboard/this_month_pending_goals/:userId", verifySchool, goals.this_month_pending_goals);
router.get("/dashboard/this_week_pendig_goals/:userId", verifySchool, goals.this_week_pending_goals);
router.get("/dashboard/today_pendig_goals/:userId", verifySchool, goals.today_pending_goals);
router.get("/dashboard/this_month_completed_goals/:userId", verifySchool, goals.this_month_completed_goals);
router.get("/dashboard/this_week_completed_goals/:userId", verifySchool, goals.this_week_completed_goals);
router.get("/dashboard/today_completed_goals/:userId", verifySchool, goals.today_completed_goals);
router.get("/dashboard/this_month_not_completed_goals/:userId", verifySchool, goals.this_month_not_completed_goals);
router.get("/dashboard/this_week_not_completed_goals/:userId", verifySchool, goals.this_week_not_completed_goals);
router.get("/dashboard/today_not_completed_goals/:userId", verifySchool, goals.today_not_completed_goals);

router.get("/weekly_goalread/:userId", verifySchool, goals.weekly_goalread);
router.get("/monthly_goalread/:userId", verifySchool, goals.monthly_goalread);
router.get("/quaterly_goalread/:userId", verifySchool, goals.quaterly_goalread);
router.get("/annual_goalread/:userId", verifySchool, goals.annual_goalread);
router.get("/searching_goal/:userId", verifySchool, goals.searching_goal);

router.get("/weekly_goal_counter/:userId", verifySchool, goals.weekly_goal_counter)
router.get("/monthly_goal_counter/:userId", verifySchool, goals.monthly_goal_counter)
router.get("/quaterly_goal_counter/:userId", verifySchool, goals.quaterly_goal_counter)
router.get("/annual_goal_counter/:userId", verifySchool, goals.annual_goal_counter)

router.get("/not_completed_goal_counter/:userId", verifySchool, goals.not_completed_goal_counter);
router.get("/completed_goal_counter/:userId", verifySchool, goals.completed_goal_counter);

module.exports = router;
