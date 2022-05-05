const express = require("express");
const router = express.Router();
const { create, update, deleteEvent, getAllEvents } = require("../../../controllers/appointment_event");
const { isAdmin } = require("../../../controllers/auth");


router.post("/admin/create_appointmentcategory/:adminId", isAdmin, create);
router.put("/admin/update_appointmentcategory/:adminId/:docId", isAdmin, update);
router.get("/admin/list_of_appointmentcategory/:adminId", isAdmin, getAllEvents);
router.delete("/admin/delete_appointmentcategory/:adminId/:docId", isAdmin, deleteEvent)
module.exports = router;