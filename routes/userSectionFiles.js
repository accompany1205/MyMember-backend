const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { addFile, updateFile, getFile, deleteFile, getAll,getAllUserData} = require("../controllers/userSectionFiles");

router.post("/userSectionFiles/add/:userId/:studentId", upload.single('doc'),verifySchool, addFile);
router.get("/userSectionFiles/get/:userSectionFiles",requireSignin, getFile);
router.get("/userSectionFiles/getall/:userId/:studentId",requireSignin, getAll);
router.put("/userSectionFiles/update/:userSectionFiles", upload.single('doc'),requireSignin, updateFile);
router.delete("/userSectionFiles/delete/:userSectionFiles", requireSignin, deleteFile);
router.get("/userSectionFiles/getallUserData/:userId",requireSignin,getAllUserData)


module.exports = router;