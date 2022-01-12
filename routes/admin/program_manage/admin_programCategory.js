const express = require('express');
const router = express.Router();
const { create, update, read, remove, catList } = require("../../../controllers/pcategory")
const { requireSignin, isAuth, verifySchool } = require("../../../controllers/auth");

router.get("/admin/programCategory_list/:adminId", verifySchool, catList)
router.get("/admin/programCategory_details/:categoryId", requireSignin, read)
router.post("/admin/program_createCategory/:adminId", requireSignin, create)
router.put("/admin/program_updateCategory/:adminId/:categoryId", requireSignin, update)
router.delete("/admin/program_deleteCategory/:adminId/:categoryId", requireSignin, remove)

module.exports = router;