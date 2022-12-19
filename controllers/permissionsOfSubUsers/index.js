const SubUsersRole = require("../../models/sub_user_roles");
const RolesList = require("../../models/rolesList")
const cloudUrl = require('../../gcloud/imageUrl');
const userSectionFiles = require("../../models/userSectionFiles")
const employeeForm = require("../../models/employeeForm")
const Task = require('../../models/task')
const mongoose = require("mongoose");
const { TrunkPage } = require("twilio/lib/rest/trunking/v1/trunk");

exports.create = async (req, res) => {
    try {
        let subUserBody = req.body
        subUserBody.roles = req.body.roles ? JSON.parse(req.body.roles) : []

        if (req.file) {
            subUserBody.profile_img = await cloudUrl.imageUrl(req.file);
        }
        var subUserObj = new SubUsersRole(subUserBody)
        subUserObj.save((err, data) => {
            if (err) {
                res.send({ 'msg': "subUser already exists!", 'success': false })
            }
            else {
                res.send({ 'msg': 'permission of sub user info add successfully.', 'success': true })
            }
        })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }

}


exports.update = async (req, res) => {
    From
    try {
        let subUserBody = req.body
        subUserBody.roles = req.body.roles ? JSON.parse(req.body.roles) : []
        if (req.file) {
            subUserBody.profile_img = await cloudUrl.imageUrl(req.file);
        }
        SubUsersRole.findByIdAndUpdate(req.params.SubUserId, subUserBody)
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

exports.updateByUserId = (req, res) => {
    try {
        SubUsersRole.findByIdAndUpdate({ userId: req.params.userId }, req.body)
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

exports.roleAggregateValue = (req, res) => {
    try {
        SubUsersRole.aggregate([
            { $match: { userId: req.params.userId } },
            {
                $group: {
                    _id: `$role`,
                    info_List: {
                        $push: {
                            firstname: '$firstname',
                            lastname: '$lastname',
                            profile_img: '$profile_img',
                        },
                    },
                    "count": { "$sum": 1 }
                },
            },
        ]).exec((err, info) => {
            if (err) {
                res.send({ 'msg': 'Info not found!', 'success': false });
            } else {
                res.send({ 'data': info, 'success': true });
            }
        });
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

exports.GetListByRoleId = (req, res) => {
    try {
        SubUsersRole.find({
            $and: [
                { userId: req.params.userId },
                { role: req.params.roleId },
            ],
        })
            .exec((err, data) => {
                if (err) {
                    res.send({ "msg": `Info Not Found!`, "success": false });
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

exports.createRolesList = async (req, res) => {
    const userId = req.params.userId;
    let digital = await employeeForm.exists({ _id: { $in: req.body.digitalId } });
    let document = await userSectionFiles.exists({ _id: { $in: req.body.documentId } });
    let task = await Task.exists({ _id: { $in: req.body.taskId } });
    try {
        if (digital) {
            let RolesListObj = new RolesList(req.body)
            digital = req.body.digitalId
            RolesListObj.userId = userId;
            RolesListObj.digitalId = digital;
            RolesListObj.save((err, data) => {
                if (err) {
                    res.send({ 'msg': err.message, 'success': false })
                }
                else {

                    res.send({ 'msg': 'Roles-List info for digital add successfully.', 'success': true })
                }
            })
        } else if (document) {
            let RolesListObj = new RolesList(req.body)
            document = req.body.documentId
            RolesListObj.userId = userId;
            RolesListObj.documentId = document;
            RolesListObj.save((err, data) => {
                if (err) {
                    res.send({ 'msg': err.message, 'success': false })
                }
                else {

                    res.send({ 'msg': 'Roles-List info document add successfully.', 'success': true })
                }
            })
        } else if (task) {
            let RolesListObj = new RolesList(req.body)
            task = req.body.taskId
            RolesListObj.userId = userId;
            RolesListObj.documentId = document;
            RolesListObj.save((err, data) => {
                if (err) {
                    res.send({ 'msg': err.message, 'success': false })
                }
                else {

                    res.send({ 'msg': 'Roles-List info task add successfully.', 'success': true })
                }
            })
        }else {
            res.send({ 'msg': 'Id is not correct', 'success': true })
        }

    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}

exports.updateRolesList = (req, res) => {
    try {
        let id = req.params.RolesListId;
        RolesList.findByIdAndUpdate(id, { $set: req.body })
            .exec((err, data) => {
                if (err) {
                    res.send({ 'msg': 'Role-List info is not update', 'success': false })
                }
                else {
                    const { roles, _id } = data;
                    SubUsersRole.updateOne({ role: _id }, { roles })
                        .exec((err, data) => {
                            if (err) {
                                res.send({ 'msg': 'sub-users roles is not update!', 'success': false })
                            }
                            else {
                                res.send({ 'msg': 'Roles List info is update successfully', 'success': true })
                            }
                        })

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

exports.deleteRoleInfo = (req, res) => {
    try {
        RolesList.findByIdAndRemove(req.params.RoleInfoId, (err, data) => {
            if (err) {
                res.send({ "msg": `${req.params.RoleInfoId} is not remove`, "success": false });
            }
            else {
                res.send({ "msg": `${req.params.RoleInfoId} is remove successfully`, "success": true });
            }
        })
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}


exports.getRolls = async (req, res) => {
    let userId = req.params.userId
    let documentData = await RolesList.aggregate([
        {
            $match: {
                userId: userId
            }
        },
        {
            $project: {
                taskId: 0,
                digitalId: 0
            }
        },
        { $unwind: "$documentId" },
        {
            $lookup: {
                from: "usersectionfiles",
                localField: "documentId",
                foreignField: "_id",
                as: "rolesData"
            }
        }
    ])

    let digitalData = await RolesList.aggregate([
        {
            $match: {
                userId: userId
            }
        },
        {
            $project: {
                taskId: 0,
                documentId: 0
            }
        },
        { $unwind: "$digitalId" },
        {
            $lookup: {
                from: "employeeForm",
                localField: "digitalId",
                foreignField: "_id",
                as: "rolesData"
            }
        }
    ])

    let taskData = await RolesList.aggregate([
        {
            $match: {
                userId: userId
            }
        },
        {
            $project: {
                digitalId: 0,
                documentId: 0
            }
        },
        { $unwind: "$taskId" },
        {
            $lookup: {
                from: "Task",
                localField: "taskId",
                foreignField: "_id",
                as: "rolesData"
            }
        }
    ])

    res.send({ "documentData": documentData, "digitalData": digitalData, "taskData": taskData, "success": true });
}

exports.submitForm = async (req, res) => {
    let subUserId = mongoose.Types.ObjectId(req.params.subuserId);
    let documentId = req.body.documentId;
    let taskId = req.body.taskId;
    let digitalId = req.body.digitalId;
    let formType = req.params.formType;
    try {
        if (formType == "document") {
            let documentData = await SubUsersRole.aggregate([
                {
                    $match: {
                        _id: subUserId
                    }
                },
                {
                    $project: {
                        documentId: 1
                    }
                },
                { $unwind: "$documentId" },
                {
                    $lookup: {
                        from: "usersectionfiles",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "documentData"
                    }
                },
                { $unwind: "$documentData" }
            ])
            documentData.map(async (ele) => {
                if (documentId == (ele.documentData._id)) {
                    let result = await userSectionFiles.updateOne({ _id: documentId }, { $set: { isSubmit: true } })
                    if (result.nModified === 1) {
                        return res.send("form submit")
                    } else {
                        return res.send("form hasn't been submit")
                    }
                }
            })
        } else if (formType == "digital") {
            let digitalData = await SubUsersRole.aggregate([
                {
                    $match: {
                        _id: subUserId
                    }
                },
                {
                    $project: {
                        digitalId: 1
                    }
                },
                { $unwind: "$digitalId" },
                {
                    $lookup: {
                        from: "employeeForm",
                        localField: "digitalId",
                        foreignField: "_id",
                        as: "digitalData"
                    }
                },
                { $unwind: "$digitalData" }
            ])
            digitalData.map(async (ele) => {
                if (digitalId == (ele.digitalData._id)) {
                    let result = await employeeForm.updateOne({ _id: digitalId }, { $set: { isSubmit: true } })
                    if (result.nModified === 1) {
                        return res.send("form submit")
                    } else {
                        return res.send("form hasn't been submit")
                    }
                }
            })
        } else if (formType == "task") {
            let taskData = await SubUsersRole.aggregate([
                {
                    $match: {
                        _id: subUserId
                    }
                },
                {
                    $project: {
                        taskId: 1
                    }
                },
                { $unwind: "$taskId" },
                {
                    $lookup: {
                        from: "Task",
                        localField: "taskId",
                        foreignField: "_id",
                        as: "taskData"
                    }
                },
                { $unwind: "$taskData" }
            ])
            taskData.map(async (ele) => {
                if (taskId == (ele.taskData._id)) {
                    let result = await Task.updateOne({ _id: taskId }, { $set: { isSubmit: true } })
                    if (result.nModified === 1) {
                        return res.send("form submit")
                    } else {
                        return res.send("form hasn't been submit")
                    }
                }
            })
        }
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}

exports.approveForm = async (req, res) => {
    let userId = req.params.userId;
    let formType = req.params.formType;
    try {
        if (formType == "document") {
            let documentData = await SubUsersRole.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $project: {
                        documentId: 1
                    }
                },
                { $unwind: "$documentId" },
                {
                    $lookup: {
                        from: "usersectionfiles",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "documentData"
                    }
                },
                { $unwind: "$documentData" }
            ])
            documentData.map(async (ele) => {
                if (ele.documentData.isSubmit) {
                    let result = await userSectionFiles.updateOne({ _id: ele.documentData._id }, { $set: { isApprove: true } })
                    if (result.nModified === 1) {
                        return res.send("form approve")
                    } else {
                        return res.send("form hasn't been approve")
                    }
                }
            })
        } else if (formType == "digital") {
            let digitalData = await SubUsersRole.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $project: {
                        digitalId: 1
                    }
                },
                { $unwind: "$digitalId" },
                {
                    $lookup: {
                        from: "employeeForm",
                        localField: "digitalId",
                        foreignField: "_id",
                        as: "digitalData"
                    }
                },
                { $unwind: "$digitalData" }
            ])
            digitalData.map(async (ele) => {
                if (ele.digitalData.isSubmit) {
                    let result = await employeeForm.updateOne({ _id: ele.digitalData._id }, { $set: { isApprove: true } })
                    if (result.nModified === 1) {
                        return res.send("form approve")
                    } else {
                        return res.send("form hasn't been approve")
                    }
                }
            })
        } else if (formType == "task") {
            let taskData = await SubUsersRole.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $project: {
                        taskId: 1
                    }
                },
                { $unwind: "$taskId" },
                {
                    $lookup: {
                        from: "Task",
                        localField: "taskId",
                        foreignField: "_id",
                        as: "taskData"
                    }
                },
                { $unwind: "$taskData" }
            ])
            taskData.map(async (ele) => {
                if (ele.taskData.isSubmit) {
                    let result = await Task.updateOne({ _id: ele.taskData._id }, { $set: { isApprove: true } })
                    if (result.nModified === 1) {
                        return res.send("form approve")
                    } else {
                        return res.send("form hasn't been approve")
                    }
                }
            })
        }
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }

}

exports.approveFormStatus = async (req, res) => {
    let userId = req.params.userId;
    let formType = req.params.formType;
    try {
        if (formType == "document") {
            let documentData = await SubUsersRole.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $project: {
                        documentId: 1
                    }
                },
                { $unwind: "$documentId" },
                {
                    $lookup: {
                        from: "usersectionfiles",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "documentData"
                    }
                },
                { $unwind: "$documentData" }
            ])
            let approve = 0
            let notApprove = documentData.length
            documentData.map(async (ele) => {
                if (ele.documentData.isApprove) {
                    approve++
                }
            })
            let result = (approve / notApprove) * 100
            if (isNaN(result)) {
                return res.send({ documentStatus: `${0} % document form are approved from  user` })
            } else {
                return res.send({ documentStatus: `${result} % document form are approved from user` })
            }

        } else if (formType == "digital") {
            let digitalData = await SubUsersRole.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $project: {
                        digitalId: 1
                    }
                },
                { $unwind: "$digitalId" },
                {
                    $lookup: {
                        from: "employeeForm",
                        localField: "digitalId",
                        foreignField: "_id",
                        as: "digitalData"
                    }
                },
                { $unwind: "$digitalData" }
            ])
            let approve = 0
            let notApprove = digitalData.length
            digitalData.map(async (ele) => {
                if (ele.digitalData.isApprove) {
                    approve++
                }
            })
            let result = (approve / notApprove) * 100
            if (isNaN(result)) {
                return res.send({ digitalData: `${0} % digital form are approved from user` })
            } else {
                return res.send({ digitalData: `${result} % digital form are approved from user` })
            }
        } else if (formType == "task") {
            let taskData = await SubUsersRole.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $project: {
                        taskId: 1
                    }
                },
                { $unwind: "$taskId" },
                {
                    $lookup: {
                        from: "Task",
                        localField: "taskId",
                        foreignField: "_id",
                        as: "taskData"
                    }
                },
                { $unwind: "$taskData" }
            ])
            let approve = 0
            let notApprove = taskData.length
            taskData.map(async (ele) => {
                if (ele.digitalData.isApprove) {
                    approve++
                } else {
                    notApprove++
                }
            })
            let result = (approve / notApprove) * 100
            if (isNaN(result)) {
                return res.send({ taskData: `${0} % task form are approved from user` })
            } else {
                return res.send({ taskData: `${result} % task form are approved from user` })
            }
        }
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }

}

exports.submitFormStatus = async (req, res) => {
    let subUserId = mongoose.Types.ObjectId(req.params.subuserId);
    let formType = req.params.formType;
    try {
        if (formType == "document") {
            let documentData = await SubUsersRole.aggregate([
                {
                    $match: {
                        _id: subUserId
                    }
                },
                {
                    $project: {
                        documentId: 1
                    }
                },
                { $unwind: "$documentId" },
                {
                    $lookup: {
                        from: "usersectionfiles",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "documentData"
                    }
                },
                { $unwind: "$documentData" }
            ])
            let submit = 0
            let notSubmit = documentData.length
            documentData.map(async (ele) => {
                if (ele.documentData.isSubmit) {
                    submit++
                }
            })
            let result = (submit / notSubmit) * 100
            if (isNaN(result)) {
                return res.send({ documentStatus: `${0} % document form are submit from  employee` })
            } else {
                return res.send({ documentStatus: `${result} % document form are submit from  employee` })
            }
        } else if (formType == "digital") {
            let digitalData = await SubUsersRole.aggregate([
                {
                    $match: {
                        _id: subUserId
                    }
                },
                {
                    $project: {
                        digitalId: 1
                    }
                },
                { $unwind: "$digitalId" },
                {
                    $lookup: {
                        from: "employeeForm",
                        localField: "digitalId",
                        foreignField: "_id",
                        as: "digitalData"
                    }
                },
                { $unwind: "$digitalData" }
            ])
            let submit = 0
            let notSubmit = digitalData.length
            digitalData.map(async (ele) => {
                if (ele.documentData.isSubmit) {
                    submit++
                }
            })
            let result = (submit / notSubmit) * 100
            if (isNaN(result)) {
                return res.send({ digitalStatus: `${0} % digital form are submit from  employee` })
            } else {
                return res.send({ digitalStatus: `${result} % digital form are submit from  employee` })
            }
        } else if (formType == "task") {
            let taskData = await SubUsersRole.aggregate([
                {
                    $match: {
                        _id: subUserId
                    }
                },
                {
                    $project: {
                        taskId: 1
                    }
                },
                { $unwind: "$taskId" },
                {
                    $lookup: {
                        from: "Task",
                        localField: "taskId",
                        foreignField: "_id",
                        as: "taskData"
                    }
                },
                { $unwind: "$taskData" }
            ])
            let submit = 0
            let notSubmit = taskData.length
            taskData.map(async (ele) => {
                if (ele.documentData.isSubmit) {
                    submit++
                }
            })
            let result = (submit / notSubmit) * 100
            if (isNaN(result)) {
                return res.send({ taskStatus: `${0} % task form are submit from  employee` })
            } else {
                return res.send({ taskStatus: `${result} % task form are submit from  employee` })
            }
        }
    } catch (error) {
        res.send({ 'msg': error.message, 'success': false });
    }
}

