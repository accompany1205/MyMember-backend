const renewalnote = require("../models/renewal_note");
const student = require("../models/addmember");
const user = require("../models/user");
const buymembership = require("../models/buy_membership")
const _ = require("lodash");
const moment = require('moment')
const dayRemaining = require("../Services/daysremaining")
// const { forEach } = require("lodash");

exports.create = (req, res) => {
    student.findById(req.params.studentId).exec((err, studetData) => {
        if (err) {
            res.send({ error: 'student data not found' })
        }
        else {
            var obj = {
                firstName: studetData.firstName,
                lastName: studetData.lastName,
                userId: req.params.userId
            }

            var renewal = new renewalnote(req.body);
            renewObj = _.extend(renewal, obj)

            renewObj.save((err, note) => {
                if (err) {
                    res.send({ error: 'renewal notes is not create' })
                }
                else {
                    student.findByIdAndUpdate(req.params.studentId, { $push: { renewals_notes: note._id } })
                        .exec((err, renewalStd) => {
                            if (err) {
                                res.send({ error: 'renewal notes is not add in student' })
                            }
                            else {
                                // res.send(note)2021
                                user.findByIdAndUpdate(req.params.userId, { $push: { renewal_history: note._id } })
                                    .exec((err, renewalUser) => {
                                        if (err) {
                                            res.send({ error: 'renewal notes is not add in school' })
                                        }
                                        else {
                                            res.send(note)
                                        }
                                    })
                            }
                        })
                }
            })

        }
    })
}

exports.remove = (req, res) => {
    var notesId = req.params.notesId
    renewalnote.findByIdAndRemove({ _id: notesId }, (err, removeNote) => {
        if (err) {
            res.send({ error: 'notes is not delete' })
        }
        else {
            student.update({ "renewals_notes": removeNote._id }, { $pull: { "renewals_notes": removeNote._id } })
                .exec((err, noteUpdateStd) => {
                    if (err) {
                        res.send({ error: 'notes is not remove in student' });
                    }
                    else {
                        user.update({ "renewal_history": removeNote._id }, { $pull: { "renewal_history": removeNote._id } })
                            .exec((err, noteUpdateUser) => {
                                if (err) {
                                    res.send({ error: 'notes is not remove in school' })
                                }
                                else {
                                    res.send({ msg: 'notes is remove successfully' })
                                }
                            })
                    }
                })
        }
    })
}

exports.updateNote = (req, res) => {
    var notesid = req.params.notesId
    renewalnote.findByIdAndUpdate(notesid, req.body).exec((err, updateNote) => {
        if (err) {
            res.send({ error: 'miss you call notes is not update' })
        }
        else {
            res.send({ msg: 'miss you call notes update successfully' })
        }
    })
}



exports.expire_thirty_std = async (req, res) => {
    try {
        let userId = req.params.userId;
        var per_page = parseInt(req.params.per_page) || 5;
        var page_no = parseInt(req.params.page_no) || 0;
        var pagination = {
            limit: per_page,
            skip: per_page * page_no,
        };
        buymembership
            .aggregate([
                { $match: { userId: userId } },
                {
                    $project: {
                        membership_type: 1,
                        membership_name: 1,
                        membership_status: 1,
                        expiry_date: { $toDate: "$expiry_date" },
                        studentInfo: 1,
                    }
                },
                {
                    $lookup: {
                        from: "members",
                        localField: "studentInfo",
                        foreignField: "_id",
                        as: 'data'
                    }
                },
                {
                    $project: {
                        membership_name: 1,
                        membership_type: 1,
                        membership_status: 1,
                        data: 1,
                        expiry_date: 1,
                        days_till_Expire: {
                            $multiply: [{
                                $floor: {
                                    $divide: [{ $subtract: [new Date(), '$expiry_date'] }, 1000 * 60 * 60 * 24]
                                }
                            }, -1]

                        },
                    }
                },

                { $match: { days_till_Expire: { $lte: 30, $gt: 0 } } },
                {
                    "$group": {
                        _id: "$data._id",

                        no_of_Memberships: { $sum: 1 },
                        firstName: { "$first": '$data.firstName' },
                        lastName: { "$first": '$data.lastName' },

                        program: { "$first": '$data.program' },
                        notes: { "$first": '$data.notes' },
                        primaryPhone: { "$first": '$data.primaryPhone' },
                        studentType: { "$first": '$data.studentType' },
                        last_contact_renewal: { "$first": '$data.last_contact_renewal' },
                        memberprofileImage: { "$first": '$data.memberprofileImage' },
                        status: { "$first": '$data.status' },
                        memberships: {
                            "$push":
                            {
                                membership_name: "$membership_name", membership_type: "$membership_type", membership_status: "$membership_status", expiry_date: "$expiry_date", days_till_Expire: "$days_till_Expire", whenFreeze: "$whenFreeze"
                            }
                        }
                    }
                },

                { $unwind: "$_id" },
                { $unwind: "$firstName" },
                { $unwind: "$lastName" },
                { $unwind: "$last_contact_renewal" },
                { $unwind: "$memberprofileImage" },
                { $unwind: "$program" },
                { $unwind: "$notes" },
                { $unwind: "$primaryPhone" },
                { $unwind: "$studentType" },
                { $unwind: "$status" },
                {
                    $facet: {
                        paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
                        totalCount: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                },


            ])
            .exec((err, memberdata) => {
                if (err) {
                    res.send({
                        error: err,
                    });
                } else {
                    let data = memberdata[0].paginatedResults
                    if (data.length > 0) {
                        res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

                    } else {
                        res.send({ msg: 'data not found', success: false });
                    }
                }
            });

    } catch (e) {
        res.send({ error: 'expire student data not fount', a: e })

    }
}

exports.expire_sixty_std = async (req, res) => {
    try {
        let userId = req.params.userId;
        var per_page = parseInt(req.params.per_page) || 5;
        var page_no = parseInt(req.params.page_no) || 0;
        var pagination = {
            limit: per_page,
            skip: per_page * page_no,
        };
        buymembership
            .aggregate([
                { $match: { userId: userId } },
                {
                    $project: {
                        membership_type: 1,
                        membership_name: 1,
                        membership_status: 1,
                        expiry_date: { $toDate: "$expiry_date" },
                        studentInfo: 1,
                    }
                },
                {
                    $lookup: {
                        from: "members",
                        localField: "studentInfo",
                        foreignField: "_id",
                        as: 'data'
                    }
                },
                {
                    $project: {
                        membership_name: 1,
                        membership_type: 1,
                        membership_status: 1,
                        data: 1,
                        expiry_date: 1,
                        days_till_Expire: {
                            $multiply: [{
                                $floor: {
                                    $divide: [{ $subtract: [new Date(), '$expiry_date'] }, 1000 * 60 * 60 * 24]
                                }
                            }, -1]

                        },
                    }
                },
                { $match: { days_till_Expire: { $lte: 60, $gt: 29 } } },
                {
                    "$group": {
                        _id: "$data._id",

                        no_of_Memberships: { $sum: 1 },
                        firstName: { "$first": '$data.firstName' },
                        lastName: { "$first": '$data.lastName' },

                        program: { "$first": '$data.program' },
                        notes: { "$first": '$data.notes' },
                        primaryPhone: { "$first": '$data.primaryPhone' },
                        studentType: { "$first": '$data.studentType' },
                        last_contact_renewal: { "$first": '$data.last_contact_renewal' },
                        memberprofileImage: { "$first": '$data.memberprofileImage' },
                        status: { "$first": '$data.status' },
                        memberships: {
                            "$push":
                            {
                                membership_name: "$membership_name", membership_type: "$membership_type", membership_status: "$membership_status", expiry_date: "$expiry_date", days_till_Expire: "$days_till_Expire", whenFreeze: "$whenFreeze"
                            }
                        }
                    }
                },

                { $unwind: "$_id" },
                { $unwind: "$firstName" },
                { $unwind: "$lastName" },
                { $unwind: "$last_contact_renewal" },
                { $unwind: "$memberprofileImage" },
                { $unwind: "$program" },
                { $unwind: "$notes" },
                { $unwind: "$primaryPhone" },
                { $unwind: "$studentType" },
                { $unwind: "$status" },
                {
                    $facet: {
                        paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
                        totalCount: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                }
            ])
            .exec((err, memberdata) => {
                if (err) {
                    res.send({
                        error: err,
                    });
                } else {
                    let data = memberdata[0].paginatedResults
                    if (data.length > 0) {
                        res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

                    } else {
                        res.send({ msg: 'data not found', success: false });
                    }
                }
            });

    } catch (e) {
        res.send({ error: 'expire student data not fount' })

    }
}


exports.expire_ninty_std = async (req, res) => {
    try {
        let userId = req.params.userId;
        var per_page = parseInt(req.params.per_page) || 5;
        var page_no = parseInt(req.params.page_no) || 0;
        var pagination = {
            limit: per_page,
            skip: per_page * page_no,
        };
        buymembership
            .aggregate([
                { $match: { userId: userId } },
                {
                    $project: {
                        membership_type: 1,
                        membership_name: 1,
                        membership_status: 1,
                        expiry_date: { $toDate: "$expiry_date" },
                        studentInfo: 1,
                    }
                },
                {
                    $lookup: {
                        from: "members",
                        localField: "studentInfo",
                        foreignField: "_id",
                        as: 'data'
                    }
                },
                {
                    $project: {
                        membership_name: 1,
                        membership_type: 1,
                        membership_status: 1,
                        data: 1,
                        expiry_date: 1,
                        days_till_Expire: {
                            $multiply: [{
                                $floor: {
                                    $divide: [{ $subtract: [new Date(), '$expiry_date'] }, 1000 * 60 * 60 * 24]
                                }
                            }, -1]

                        },
                    }
                },

                { $match: { days_till_Expire: { $lte: 90, $gt: 59 } } },

                {
                    "$group": {
                        _id: "$data._id",

                        no_of_Memberships: { $sum: 1 },
                        firstName: { "$first": '$data.firstName' },
                        lastName: { "$first": '$data.lastName' },

                        program: { "$first": '$data.program' },
                        notes: { "$first": '$data.notes' },
                        primaryPhone: { "$first": '$data.primaryPhone' },
                        studentType: { "$first": '$data.studentType' },
                        last_contact_renewal: { "$first": '$data.last_contact_renewal' },
                        memberprofileImage: { "$first": '$data.memberprofileImage' },
                        status: { "$first": '$data.status' },
                        memberships: {
                            "$push":
                            {
                                membership_name: "$membership_name", membership_type: "$membership_type", membership_status: "$membership_status", expiry_date: "$expiry_date", days_till_Expire: "$days_till_Expire", whenFreeze: "$whenFreeze"
                            }
                        }
                    }
                },

                { $unwind: "$_id" },
                { $unwind: "$firstName" },
                { $unwind: "$lastName" },
                { $unwind: "$last_contact_renewal" },
                { $unwind: "$memberprofileImage" },
                { $unwind: "$program" },
                { $unwind: "$notes" },
                { $unwind: "$primaryPhone" },
                { $unwind: "$studentType" },
                { $unwind: "$status" },

                {
                    $facet: {
                        paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
                        totalCount: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                },
            ])
            .exec((err, memberdata) => {
                if (err) {
                    res.send({
                        error: err,
                    });
                } else {
                    let data = memberdata[0].paginatedResults
                    if (data.length > 0) {
                        res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

                    } else {
                        res.send({ msg: 'data not found', success: false });
                    }
                }
            });

    } catch (e) {
        res.send({ error: 'expire student data not fount' })

    }
}


exports.frozenmembership = async (req, res) => {
    try {
        let userId = req.params.userId;
        var per_page = parseInt(req.params.per_page) || 5;
        var page_no = parseInt(req.params.page_no) || 0;
        var pagination = {
            limit: per_page,
            skip: per_page * page_no,
        };
        buymembership
            .aggregate([
                { $match: { userId: userId } },
                {
                    $project: {
                        membership_name: 1,
                        membership_type: 1,
                        membership_status: 1,
                        expiry_date: { $toDate: "$expiry_date" },
                        studentInfo: 1,
                        whenFreeze: 1,
                        isFreeze: 1
                    }
                },
                {
                    $lookup: {
                        from: "members",
                        localField: "studentInfo",
                        foreignField: "_id",
                        as: 'data'
                    }
                },
                {
                    $project: {
                        membership_name: 1,
                        membership_status: 1,
                        membership_type: 1,
                        data: 1,
                        whenFreeze: 1,
                        isFreeze: 1,
                        expiry_date: 1,
                        days_till_Expire: {
                            $multiply: [{
                                $floor: {
                                    $divide: [{ $subtract: [new Date(), '$expiry_date'] }, 1000 * 60 * 60 * 24]
                                }
                            }, -1]

                        },
                    }
                },
                {
                    $sort: {
                        "memberships": 1
                    }
                },
                { $match: { $or: [{ membership_status: "freeze" }, { isFreeze: true }] } },
                {
                    "$group": {
                        _id: "$data._id",

                        no_of_Memberships: { $sum: 1 },
                        firstName: { "$first": '$data.firstName' },
                        lastName: { "$first": '$data.lastName' },

                        program: { "$first": '$data.program' },
                        notes: { "$first": '$data.notes' },
                        primaryPhone: { "$first": '$data.primaryPhone' },
                        studentType: { "$first": '$data.studentType' },
                        last_contact_renewal: { "$first": '$data.last_contact_renewal' },
                        memberprofileImage: { "$first": '$data.memberprofileImage' },
                        status: { "$first": '$data.status' },
                        memberships: {
                            "$push":
                            {
                                isFreeze: "$isFreeze", membership_name: "$membership_name", membership_status: "$membership_status", membership_type: "$membership_type", expiry_date: "$expiry_date", days_till_Expire: "$days_till_Expire", whenFreeze: "$whenFreeze"
                            }
                        }
                    }
                },

                { $unwind: "$_id" },
                { $unwind: "$firstName" },
                { $unwind: "$lastName" },
                { $unwind: "$last_contact_renewal" },
                { $unwind: "$memberprofileImage" },
                { $unwind: "$program" },
                { $unwind: "$notes" },
                { $unwind: "$primaryPhone" },
                { $unwind: "$studentType" },
                { $unwind: "$status" },

                {
                    $facet: {
                        paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
                        totalCount: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                }
            ])
            .exec((err, memberdata) => {
                if (err) {
                    res.send({
                        error: err,
                    });
                } else {
                    console.log(memberdata)
                    let data = memberdata[0].paginatedResults
                    if (data.length > 0) {
                        res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

                    } else {
                        res.send({ msg: 'data not found', success: false });
                    }
                }
            });

    } catch (e) {
        res.send({ error: 'frozen student data not fount' })

    }
}
