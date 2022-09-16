const express = require("express");
const router = express.Router();
const appointment = require("../controllers/appointment")
const upload = require('../handler/multer');
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.post("/add_appointment/:userId", verifySchool, appointment.Create);
router.post("/add_appointment/v2/:userId", verifySchool, upload.single('eventBanner'), appointment.apptCreate);
router.post("/eventmanager/addguest/sendemail/:userId",verifySchool,appointment.sendEmailToGuest);
router.get("/appointment/list_of_appointments/:userId/:dates", verifySchool, appointment.read);
router.get("/eventManager/singleEvent/:userId/:apptId", appointment.singleRead);
router.get("/appointment/list_of_appointments_onCategory/:userId/:page_no/:per_page/:catType", verifySchool, appointment.catRead);
router.get("/appointment/list_of_appoinment_info/:userId/:appointId", requireSignin, appointment.appointInfo)
router.put("/appointment/update_appointment/:userId/:appointId", requireSignin, upload.single('eventBanner'), appointment.update);
router.put("/appointment/update_all_appointment/:userId/:oldcategoryname", requireSignin, appointment.updateAll);
router.delete("/delete_appointment/:userId/:appointId", requireSignin, appointment.remove);
router.get("/appointmentFilter/:catType/:userId/:page_no/:per_page", verifySchool, appointment.appointmentFilter);
router.delete("/appointment/delete_all/:userId/:oldcategoryname", verifySchool, appointment.deleteAll)
router.post("/addInvitee/:userId/:eventId", verifySchool, appointment.addInvitee);
router.get("/getInvitee/:userId/:eventId",verifySchool, appointment.getInvitees);
router.post("/registerInvitee/:userId/:eventId", verifySchool, appointment.registerInvitee);
router.get("/getRegisteredInvitee/:userId/:eventId", verifySchool, appointment.getRegisteredInvitees);
router.post("/addToAttended/:userId/:eventId",verifySchool, appointment.addToAttended);
router.get("/getAttendee/:userId/:eventId", verifySchool, appointment.getAttended);
router.post("/payAndRegister/:userId", verifySchool, appointment.payForRegister);
router.delete("/deleteInvitee/:userId", verifySchool, appointment.deleteInvitee);
router.delete("/deleteRegistered/:userId", verifySchool, appointment.deleteRegister);
router.post("/eventManager/filterEvent/:userId", verifySchool, appointment.filterEvents);
router.get("/allAppt/:userId",verifySchool, appointment.allEvents);
router.put("/eventManager/eventPay/:userId/:eventRegisteredId",verifySchool, appointment.eventPay);
router.get("/promotion_belt_count/:userId/:eventId",verifySchool,appointment.promotionBeltCount)
router.get("/general_belt_count/:userId/:eventId",verifySchool,appointment.generalBeltCount)


module.exports = router;
