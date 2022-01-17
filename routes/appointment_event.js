const express = require("express");
const router = express.Router();
const { create, update, deleteEvent, getAllEvents } = require("../controllers/appointment_event");
const { verifySchool } = require("../controllers/auth");


router.post("/create_appointmentcategory/:userId", verifySchool, create);
router.put("/update_appointmentcategory/:userId/:docId", verifySchool, update);
router.get("/list_of_appointmentcategory/:userId", verifySchool, getAllEvents);
router.delete("/delete_appointmentcategory/:userId/:docId", verifySchool, deleteEvent)
module.exports = router;