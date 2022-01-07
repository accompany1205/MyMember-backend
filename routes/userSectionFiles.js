const express = require("express");
const router = express.Router();
const upload = require('../handler/multer');
const { addFile, updateFile, getFile, deleteFile, getAll} = require("../controllers/userSectionFiles");

router.post("/userSectionFiles/add/:userId/:studentId", upload.single('doc'), addFile);
router.get("/userSectionFiles/get/:userSectionFiles", getFile);
router.get("/userSectionFiles/getall/:userId/:studentId", getAll);
router.put("/userSectionFiles/update/:userSectionFiles", upload.single('doc'), updateFile);
router.delete("/userSectionFiles/delete/:userSectionFiles", deleteFile)


module.exports = router;