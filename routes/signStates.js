const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { addRequestSign, getRequestSignParam, primarySetSignItems, getRequestSign, setSignItems, inviteeMailSent, getSignItems, getAllStudentDocs} = require("../controllers/signStates");
const upload = require('../handler/multer');

router.post("/docusign/addSignerInfo/:userId", requireSignin, addRequestSign);
//req.params requireas signer-email;
router.get("/docusign/setSignerStatusAndViewed/:userId/:docuSignId", requireSignin, getRequestSignParam);
router.get("/docusign/getStatus/:userId/:docuSignId/:emailToken", getRequestSign);
router.post("/docusign/setSignItems/:userId/:docuSignId/:emailToken", setSignItems);
router.post("/docusign/primarySetSignItems/:userId/:docuSignId/:emailToken", primarySetSignItems);
router.get("/docusign/getSignItems/:userId/:docuSignId/:emailToken", getSignItems);
router.post("/docusign/inviteeEmail/:userId", requireSignin, inviteeMailSent);
router.get("/docusign/getDoc/:userId/:buyMembershipId", requireSignin, getAllStudentDocs);

module.exports = router;