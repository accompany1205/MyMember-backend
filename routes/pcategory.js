const express = require('express');
const router = express.Router();
const { create, update, read, remove, catList } = require("../controllers/pcategory")
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.get("/programCategory_list/:userId", verifySchool, catList)
router.get("/programCategory_details/:categoryId", requireSignin, read)
router.post("/program_createCategory/:userId", requireSignin, create)
router.put("/program_updateCategory/:userId/:categoryId", requireSignin, update)
router.delete("/program_deleteCategory/:userId/:categoryId", requireSignin, remove)

module.exports = router;