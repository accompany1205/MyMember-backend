const express = require("express");
const router = express.Router();
const Form = require("../../models/builder/Form.js")
const addmember = require("../../models/addmember.js")
const {viewForm, processForm} = require("../../controllers/builder/view-form")
/*
* /builder/view/:formId
*
*
*/

router.get('/:formId/:userId', viewForm)

router.post("/process/newstudent/:formId/:userId", processForm)


module.exports = router