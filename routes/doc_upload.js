const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");
const { docupload, file_sample, groupList, updatedocupload, docremove } = require("../controllers/doc_upload")
const upload = require("../handler/multer")

router.get("/group_student_list/:userId", verifySchool, groupList)
router.get("/sample_file/:userId", verifySchool, file_sample)

router.post("/upload_document/:userId/:folderId/:subFolderId", verifySchool, upload.array('document', 8), docupload)
router.put("/update_upload_document/:userId/:docId", verifySchool, upload.single('document'), updatedocupload)
router.delete("/remove_upload_document/:userId/:docId", verifySchool, docremove)

module.exports = router
