const express = require("express");
const router = express.Router();
const { candidate_readAdmin, candidate_create, candidate_update, candidate_detail, candidate_remove } = require("../../../controllers/candidate")
const { requireSignin, isAuth, verifySchool, isAdmin } = require("../../../controllers/auth");
const upload = require('../../../handler/multer')

router.get("/admin/list_of_candidate/:adminId", isAdmin, candidate_readAdmin);
router.post("/admin/add_candidate/:adminId", isAdmin, upload.single('candidate_image'), candidate_create);
router.put("/admin/update_candidate/:adminId/:candidateId", isAdmin, upload.single('candidate_image'), candidate_update);
router.get("/admin/candidate_info/:adminId/:candidateId", isAdmin, candidate_detail);
router.delete("/admin/delete_candidate/:adminId/:candidateId", isAdmin, candidate_remove);

module.exports = router;