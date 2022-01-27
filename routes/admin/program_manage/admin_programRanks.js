const express = require("express");
const router = express.Router();
const program = require("../../../controllers/program_rank")
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

const upload = require('../../../handler/multer')

router.get("/admin/program_rank_info/:adminId/:program_rank_id", isAdmin, program.program_Info);
router.post("/admin/add_program_rank/:adminId/:program_Id", isAdmin, upload.single("rank_image"), program.create);
//router.get("/list_of_program_rank/:adminId",requireSignin,program.read);
router.put("/admin/update_program_rank/:adminId/:program_rank_id", isAdmin, upload.single("rank_image"), program.update);
router.delete("/admin/delete_program_rank/:adminId/:program_rank_id", isAdmin, program.remove);

module.exports = router;
