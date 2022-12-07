const express = require('express');
const router = express.Router();
const permissionsOfSubUsers = require("../../controllers/permissionsOfSubUsers");
const upload = require('../../handler/multer')

router.post("/sub-users/permissions/create/:userId", upload.single('profile_img'), permissionsOfSubUsers.create);
router.put("/sub-users/permissions/update/:SubUserId", upload.single('profile_img'), permissionsOfSubUsers.update);

router.get("/sub-users/permissions/list", permissionsOfSubUsers.getList);
router.get("/sub-users/role/aggregate/:userId", permissionsOfSubUsers.roleAggregateValue);
router.get("/sub-users/permissions/:userId", permissionsOfSubUsers.readByUserId);
router.get("/sub-users/permissions/:userId/role_id/:roleId", permissionsOfSubUsers.GetListByRoleId);
router.get("/sub-users/permissions/:subUserId", permissionsOfSubUsers.readById);

router.delete("/sub-users/permissions/:subUserId", permissionsOfSubUsers.deleteSubUserInfo);

// ***** Roles List API's *****

router.get("/roles-list/info/:userId", permissionsOfSubUsers.getRolesList);
router.post("/roles-list/create/:userId", permissionsOfSubUsers.createRolesList);
router.put("/roles-list/update/:RolesListId", permissionsOfSubUsers.updateRolesList);
router.delete("/roles-list/delete/:RoleInfoId", permissionsOfSubUsers.deleteRoleInfo);


module.exports = router