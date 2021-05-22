const express = require("express");
const router = express.Router();
const { requireSignin,isAuth,verifySchool } = require("../controllers/auth");
const { send_sms,save_sms,remove_sms,update_sms,recieve,remove_send_recieve_sms,searchStd_chat,list_std_chat,all_chat_list } = require("../controllers/text_sms_general")

router.post("/text_general/student_search_chat_sms/:userId",verifySchool,searchStd_chat)
router.get("/text_general/student_chat_list/:userId/:stdId",verifySchool,list_std_chat) //chat list perticular student
router.get("/text_general/all_chat_list/:userId",all_chat_list)
router.post("/text_general/send_text_sms/:userId/:stdId",send_sms)
router.delete("/text_general/delete_send_recieve_sms/:userId/:stdId/:smsId",verifySchool,remove_send_recieve_sms)

router.post("/text_general/save_text_sms/:userId/:folderId",verifySchool,save_sms)
router.put("/text_general/update_text_sms/:userId/:textId",verifySchool,update_sms)
router.delete("/text_general/remove_text_sms/:userId/:textId",verifySchool,remove_sms)

// router.post("/text_recieve",recieve)

module.exports = router;