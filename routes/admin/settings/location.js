const express = require('express');
const router = express.Router();
const { isAdmin } = require("../../../controllers/auth")
const { addLocation, access_school, listLocation, updateLocation, removeLocation } = require("../../../controllers/admin/settings/location")

router.get("/list_location/:adminId", isAdmin, listLocation)
router.post("/add_location/:adminId/:userId", isAdmin, addLocation)
router.post('/access_school/:adminId/:userId', isAdmin, access_school);
router.put("/update_location/:adminId/:locationId", isAdmin, updateLocation)
router.delete("/remove_location/:adminId/:locationId", isAdmin, removeLocation)

module.exports = router