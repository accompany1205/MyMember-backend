const express = require("express");
const router = express.Router();
const goals_setting = require("../controllers/goal_setting")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

///Akash
router.post("/add_goals_setting/:userId", verifySchool, goals_setting.goalSettingCreate);
router.get("/list_of_goals_setting/:userId", verifySchool, goals_setting.goalSettingread);
router.put("/update_goals_setting/:userId/:goalId", requireSignin, goals_setting.goalsettingupdate);
router.get("/goals_info_setting/:userId/:goalId", requireSignin, goals_setting.goalsettinginfo);
router.delete("/delete_goals_setting/:userId/:goalId", requireSignin, goals_setting.goalsettingremove);



module.exports = router;
