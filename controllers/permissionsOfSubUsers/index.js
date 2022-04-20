const SubUsersRole = require("../../models/sub_user_roles");
const RolesList = require("../../models/rolesList")

exports.create = (req, res) => {
    try {
        var subUserObj = new SubUsersRole(req.body)
        subUserObj.save((err, data) => {
            if (err) {
                res.send({ 'msg': err.message, 'success': false })
            }
            else {
                res.send({ 'msg': 'permission of sub user info add successfully.', 'success': true })
            }
        })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }

}


exports.update = (req, res) => {
    try {
        SubUsersRole.findByIdAndUpdate(req.params.SubUserId, req.body)
            .exec((err, data) => {
                if (err) {
                    res.send({ 'msg': 'sub-users info is not update', 'success': false })
                }
                else {
                    res.send({ 'msg': 'permission of sub user info is update successfully', 'success': true })
                }
            })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}

exports.updateByUserId = (req,res)=>{
    try{
        SubUsersRole.findByIdAndUpdate({ userId: req.params.userId }, req.body)
        .exec((err, data) => {
            if (err) {
                res.send({ 'msg': 'sub-users info is not update', 'success': false })
            }
            else {
                res.send({ 'msg': 'permission of sub user info is update successfully', 'success': true })
            }
        })
    }catch(error){
        res.send({ 'msg': error.message, 'success': false });
    }
}

exports.getList = (req, res) => {
    try {
        SubUsersRole.find()
            .exec((err, data) => {
                if (err) {
                    res.send({ "msg": "sub-users list not found", "success": false });
                }
                else {
                    res.send({ "data": data, "success": true });
                }
            })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}

exports.readByUserId = (req, res) => {
    try {
        SubUsersRole.find({ userId: req.params.userId })
            .exec((err, data) => {
                if (err) {
                    res.send({ "msg": `${req.params.userId} Info Not Found!`, "success": false });
                }
                else {
                    res.send({ "data": data, "success": true });
                }
            })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}

exports.readById = (req, res) => {
    try {
        SubUsersRole.findById(req.params.subUserId)
            .exec((err, data) => {
                if (err) {
                    res.send({ "msg": `${req.params.subUserId} info is not found`, "success": false })
                }
                else {
                    res.send({ "data": data, "success": true });
                }
            })

    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}


exports.deleteSubUserInfo = (req, res) => {
    try {
        SubUsersRole.findByIdAndRemove(req.params.subUserId, (err, data) => {
            if (err) {
                res.send({ "msg": `${req.params.subUserId} is not remove`, "success": false });
            }
            else {
                res.send({ "msg": `${req.params.subUserId} is remove successfully`, "success": true });
            }
        })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}


// **** Roles List ****

exports.createRolesList = (req, res) => {
    try {
        var RolesListObj = new RolesList(req.body)
        RolesListObj.save((err, data) => {
            if (err) {
                res.send({ 'msg': err.message, 'success': false })
            }
            else {
                res.send({ 'msg': 'Roles-List info add successfully.', 'success': true })
            }
        })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}

exports.updateRolesList = (req, res) => {
    try {
        RolesList.findByIdAndUpdate(req.params.RolesListId, req.body)
            .exec((err, data) => {
                if (err) {
                    res.send({ 'msg': 'Role-List info is not update', 'success': false })
                }
                else {
                    res.send({ 'msg': 'Roles List info is update successfully', 'success': true })
                }
            })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}

exports.getRolesList = (req, res) => {
    try {
        RolesList.find({ userId: req.params.userId })
            .exec((err, data) => {
                if (err) {
                    res.send({ "msg": "Roles list not found", "success": false });
                }
                else {
                    res.send({ "data": data, "success": true });
                }
            })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}