const express = require("express");
const router = express.Router();

const { login } = require("../controllers/sub_user_roles");

router.post("/sub_user_roles/signin", login);

module.exports = router;
