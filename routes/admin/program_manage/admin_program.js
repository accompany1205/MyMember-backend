const express = require("express");
const router = express.Router();
const program = require("../../../controllers/program")
const { requireSignin, isAuth, verifySchool, isAdmin } = require("../../../controllers/auth");
const upload = require('../../../handler/multer')

router.post("/admin/add_program/:adminId", isAdmin, upload.single("program_image"), program.create);
router.get("/admin/list_of_program/:adminId", isAdmin, program.readAdmin);
router.get("/admin/program_details/:adminId/:proId", isAdmin, program.programs_detail);
router.get("/admin/program_rank/:adminId/:proId", isAdmin, program.program_rank)
router.put("/admin/update_program/:adminId/:proId", isAdmin, upload.single("program_image"), program.update);
router.delete("/admin/delete_program/:adminId/:proId", isAdmin, program.remove);

module.exports = router;