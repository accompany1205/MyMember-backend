const express = require("express");
const router = express.Router();

const {
    create,
    categoryById,
    update,
    remove,
    list,
    typeList
} = require("../../controllers/builder/template_category")

const { requireSignin, isAuth, isAdmin } = require("../../controllers/auth");

/*
* /builder/view/:formId
*
*
*/

//template category
router.get("/:adminId", requireSignin, list);
router.get("/types/:adminId", requireSignin, typeList);
router.post("/:adminId", requireSignin, create);
router.get("/:categoryId/:adminId", requireSignin, categoryById);
router.patch("/:categoryId/:adminId", requireSignin, update);
router.delete("/:categoryId/:adminId", requireSignin, remove);


module.exports = router
