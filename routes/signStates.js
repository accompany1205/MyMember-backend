const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { addRequestSign, getRequestSignParam, getRequestSign, setSignItems, inviteeMailSent, getAllStudentDocs} = require("../controllers/signStates");
const upload = require('../handler/multer');

router.post("/docusign/addSignerInfo/:userId", requireSignin, addRequestSign);
//req.params requireas signer-email;
router.get("/docusign/setSignerStatusAndViewed/:userId/:docuSignId", requireSignin, getRequestSignParam);
router.get("/docusign/getStatus/:userId/:docuSignId", requireSignin, getRequestSign);
router.get("/docusign/setSignItems/:userId/:docuSignId", requireSignin, setSignItems);
router.post("/docusign/inviteeEmail/:userId", requireSignin, inviteeMailSent);
router.get("/docusign/getAllDocs/:userId/:studentId", requireSignin, getAllStudentDocs);

module.exports = router;