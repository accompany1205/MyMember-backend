const express = require('express');
const router = express.Router();
const { create, getadminCategory, update_category, info_category, remove_category, category_total } = require("../../../controllers/expenses_category")
const { requireSignin, isAuth, isAdmin } = require("../../../controllers/auth");

router.get("/admin/expenses/list_category/:adminId", isAdmin, getadminCategory);
router.post("/admin/expenses/add_category/:adminId", isAdmin, create);
router.get("/admin/expenses/info_category/:adminId/:categoryId", requireSignin, info_category);
router.put("/admin/expenses/update_category/:adminId/:categoryId", requireSignin, update_category);
//new
router.delete("/admin/expenses/remove_category/:adminId/:categoryId", requireSignin, remove_category);

//all expense list with total
router.get("/admin/expenses/all_category_total/:adminId", isAdmin, category_total)
//

module.exports = router