const express = require("express");
const router = express.Router();
const {
  startWork,
  endWork,
  updateWork,
  getWorkHistory,
} = require("../controllers/workHistory");
const { requireSignin, isAuth } = require("../controllers/auth");

router.post("/workhistory/startwork", startWork);
router.post("/workhistory/endwork", endWork);
router.post("/workhistory/updatework", updateWork);
router.get("/workhistory/:employeeId", getWorkHistory);

module.exports = router;
