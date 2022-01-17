const express = require("express");
const router = express.Router();
const appointment = require("../controllers/appointment")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.post("/add_appointment/:userId", verifySchool, appointment.Create);
router.get("/appointment/list_of_appointments/:userId", verifySchool, appointment.read);
router.get("/appointment/list_of_appointments_onCategory/:userId/:page_no/:per_page/:catType", verifySchool, appointment.catRead);
router.get("/appointment/list_of_appoinment_info/:userId/:appointId", requireSignin, appointment.appointInfo)
router.put("/appointment/update_appointment/:userId/:appointId", requireSignin, appointment.update);
router.put("/appointment/update_all_appointment/:userId/:oldcategoryname", requireSignin, appointment.updateAll);
router.delete("/delete_appointment/:userId/:appointId", requireSignin, appointment.remove);
router.post("/appointmentFilter/:userId/:page_no/:per_page", verifySchool, appointment.appointmentFilter);
router.delete("/appointment/delete_all/:userId/:oldcategoryname", verifySchool, appointment.deleteAll)

module.exports = router;
