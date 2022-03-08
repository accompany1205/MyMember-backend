const express = require('express');
const router = express.Router();
const { create,remove,updateNote,expireStd,expire_thirty_std,expire_sixty_std } = require("../controllers/renewal_note");
const { requireSignin, isAuth, verifySchool } = require("../controllers/auth");

router.post("/renewal/add_note/:userId/:studentId",verifySchool,create);
router.put("/renewal/update_note/:userId/notesId",requireSignin,updateNote)
router.delete("/renewal/delete_note/:userId/:notesId",requireSignin,remove);

router.get("/renewal/expire_memebership_std/:userId",expireStd)
router.get("/renewal/expire_membership_std_less_thirty",expire_thirty_std)
router.get("/renewal/expire_membership_std_less_sixty",expire_sixty_std)

module.exports = router;