const express = require('express');
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");
const { docupload, file_sample, groupList, updatedocupload, docremove } = require("../../../controllers/doc_upload")
const upload = require("../../../handler/multer")

router.get("/admin/group_student_list/:adminId", isAdmin, groupList)
router.get("/admin/sample_file/:adminId", isAdmin, file_sample)

router.post("/admin/upload_document/:adminId/:folderId/:subFolderId", isAdmin, upload.single('document'), docupload)
router.put("/admin/update_upload_document/:adminId/:docId", isAdmin, upload.single('document'), updatedocupload)
router.delete("/admin/remove_upload_document/:adminId/:docId", isAdmin, docremove)

module.exports = router
