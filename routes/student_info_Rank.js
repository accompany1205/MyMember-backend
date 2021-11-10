const express = require('express');
const router = express.Router();
const { requireSignin, isAuth } = require("../controllers/auth");

const { addRank, getRank, removeRank, updateRank } = require('../controllers/student_info_Rank')


router.post("/member/add_Rank/:userId/:studentId",requireSignin, addRank);
router.get("/member/get_Rank/:userId/:studentId", requireSignin, getRank);
router.put("/member/updateRank/:studentId/:rankId", requireSignin, updateRank);
router.delete("/member/remove_Rank/:userId/:rankId", requireSignin, removeRank);




module.exports = router
