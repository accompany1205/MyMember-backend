const express = require("express");
const router = express.Router();
const { candidate_read, candidate_create, candidate_update, candidate_detail, candidate_remove } = require("../controllers/candidate_stripe")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const upload = require('../handler/multer')

router.get("/list_of_candidate/:userId", verifySchool, candidate_read);
router.post("/add_candidate/:userId", verifySchool, candidate_create);
router.put("/update_candidate/:userId/:candidateId", verifySchool, upload.single('stripe_image'), candidate_update);
router.get("/candidate_info/:userId/:candidateId", verifySchool, candidate_detail);
router.delete("/delete_candidate/:userId/:candidateId", verifySchool, candidate_remove);

module.exports = router;
