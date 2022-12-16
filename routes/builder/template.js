const express = require("express");
const router = express.Router();
const upload = require('../../handler/multer')
const {
    createTemplate,
    updateTemplate,
    deletedTemplate,
    createForm,
    getDetailTemplate,
    getTemplates,
    deleteForm


} = require("../../controllers/builder/template")

const { requireSignin, isAuth, verifySchool, isAdmin } = require("../../controllers/auth");

/*
* /builder/view/:formId
*
*
*/

//funnel
router.post("/:userId", requireSignin, upload.single('file'), createTemplate);
router.post("/form/:userId", requireSignin, createForm);
router.delete("/form/:id", requireSignin, deleteForm);
router.get("/:userId/:page_no/:per_page", requireSignin, getTemplates);
router.patch("/:templateId/:userId", requireSignin, updateTemplate);
router.delete("/:templateId/:userId", requireSignin, deletedTemplate);
router.get("/:templateId", requireSignin, getDetailTemplate);



module.exports = router
