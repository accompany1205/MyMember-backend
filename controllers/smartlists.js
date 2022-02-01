const smartlist = require('../models/smartlists')
const member = require('../models/addmember')
const buymembership = require('../models/buy_membership')
const membership = require('../models/buy_membership')
const financeInfo = require('../models/finance_info')
exports.get_smart_list = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }

        let sl_data = await smartlist.find({ userId: userId })
        res.send({ data: sl_data, success: true });
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}
exports.create_smart_list = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }
        let { membership_status, finance, renewal } = req.body.criteria
        let promises = [];
        let obj = req.body.criteria
        for (const i in obj) {
            if (obj[i].length && i !== "membership_status" && i !== "finance" && i !== "renewal") {
                promises.push({ [i]: { $in: obj[i] } })
            }
        }
        Promise.all(promises);
        if (promises.length) {
            var [leadData] = await member.aggregate([{
                $match: {
                    userId: userId,
                    $and: promises
                }
            },
            {
                $project: { _id: 1 }
            },

            {
                $group: {
                    _id: "",
                    ids: { $addToSet: "$_id" }
                }
            },
            {
                $project: { _id: 0 }
            },

            ])
            leadData = leadData.ids
        } else {
            leadData = []
        }
        if (membership_status) {
            var [membershipData] = await membership.aggregate([{
                $match: { userId: userId, membership_status: { $in: membership_status } }
            }, {
                $project: {
                    studentInfo: 1,
                    membership_status: 1
                }
            }, { $unwind: "$studentInfo" },
            {
                $lookup: {
                    from: "members",
                    localField: "studentInfo",
                    foreignField: "_id",
                    as: "data"
                }
            },
            {
                $project: {
                    data: "$data._id",
                    _id: 0,

                }
            },
            { $unwind: "$data" },
            {
                "$group": {
                    "_id": "",
                    "ids": { "$addToSet": "$data" }
                }
            },
            {
                $project: {
                    _id: 0,
                }
            },
            ])

            if (membershipData.ids.length) {
                membershipData = membershipData.ids
                if (leadData.length) {
                    leadData = leadData.filter(e => {
                        return membershipData.some(item => String(item) === String(e));
                    })
                } else {
                    leadData = []
                }
            }
        }
        if (finance) {
            if (finance.includes('expired')) {
                var financeData = await financeInfo.aggregate(
                    [{
                        $match: {
                            userId: userId
                        }
                    },
                    {
                        $project: {
                            studentId: 1,
                            expiry_date: 1,
                            month: { $month: "$$NOW" },
                            year: { $toInt: { $substrBytes: [{ $toString: { $year: "$$NOW" } }, 2, -1] } },
                            expired_month: { $toInt: { $substrBytes: ["$expiry_date", 0, 2] } },
                            expired_year: { $toInt: { $substrBytes: ["$expiry_date", 2, -1] } },

                        }
                    },
                    {
                        $addFields: {
                            studentId: { $convert: { input: '$studentId', to: 'objectId', onError: '', onNull: '' } }
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            localField: "studentId",
                            foreignField: "_id",
                            as: "data"
                        }
                    },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $gte: ["$year", "$expired_year"] },
                                    { $gte: ["$month", "$expired_month"] }
                                ]
                            },
                        }
                    },
                    {
                        $project: {
                            data: "$data._id",
                            _id: 0,

                        }
                    },

                    { $unwind: "$data" },
                    {
                        "$group": {
                            "_id": "",
                            "data": { "$addToSet": "$data" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                        }
                    },
                    ]
                )
                financeData = financeData.data ? financeData.data : []
            }
            if (finance.includes('not_expired')) {
                let not_expiredFinance = await financeInfo.aggregate(
                    [{
                        $match: {
                            userId: userId
                        }
                    },
                    {
                        $project: {
                            studentId: 1,
                            expiry_date: 1,
                            month: { $month: "$$NOW" },
                            year: { $toInt: { $substrBytes: [{ $toString: { $year: "$$NOW" } }, 2, -1] } },
                            expired_month: { $toInt: { $substrBytes: ["$expiry_date", 0, 2] } },
                            expired_year: { $toInt: { $substrBytes: ["$expiry_date", 2, -1] } },
                        }
                    },
                    {
                        $addFields: {
                            studentId: { $convert: { input: '$studentId', to: 'objectId', onError: '', onNull: '' } }
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            localField: "studentId",
                            foreignField: "_id",
                            as: "data"
                        }
                    },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $gt: ["$expired_year", "$year"] },
                                ]
                            },
                        }
                    },
                    {
                        $project: {
                            data: "$data._id",
                            _id: 0

                        }
                    },

                    { $unwind: "$data" },
                    {
                        "$group": {
                            "_id": "",
                            "data": { "$addToSet": "$data" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                        }
                    },
                    ]
                )
                if (financeData) {
                    financeData.push(...not_expiredFinance[0].data)
                } else {
                    financeData = [...not_expiredFinance[0].data]
                }
            }
            if (leadData.length) {
                leadData = leadData.filter(e => {
                    return financeData.some(item => String(item) === String(e));
                })
            } else {
                leadData = []
            }
        }

        if (renewal) {
            var renewalData = await buymembership
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

                    { $match: { days_till_Expire: { $lte: renewal[0], $gt: 0 } } },
                    {
                        $project: {
                            data: "$data._id",
                            _id: 0

                        }
                    },

                    { $unwind: "$data" },
                    {
                        "$group": {
                            "_id": "",
                            "data": { "$addToSet": "$data" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                        }
                    },
                ])
            if (renewalData.length) {
                renewalData = renewalData[0].data
                if (leadData.length) {
                    leadData = leadData.filter(e => {
                        return renewalData.some(item => String(item) === String(e));
                    })
                } else {
                    leadData = []
                }
            }
        }
        let sldata = smartlist({
            smartlistname: req.body.smartlistname,
            smartlists: leadData,
            criteria: req.body.criteria,
            userId: userId
        })
        sldata.save((err, sldata) => {
            if (err) {
                res.send({ error: err.message.replace(/\"/g, ""), success: false });

            } else {
                return res.send({ msg: sldata, success: true });

            }
        })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }
}

exports.update_smart_list = async (req, res) => {
    try {
        let userId = req.params.userId
        let slId = req.params.slId
        if (!slId) {
            res.json({
                success: false,
                msg: "Please give the leadsId  in params!"
            })
        }
        let { membership_status, finance, renewal } = req.body.criteria
        let promises = [];
        let obj = req.body.criteria
        for (const i in obj) {
            if (obj[i].length && i !== "membership_status" && i !== "finance" && i !== "renewal") {
                promises.push({ [i]: { $in: obj[i] } })
            }
        }
        Promise.all(promises);
        if (promises.length) {
            var [leadData] = await member.aggregate([{
                $match: {
                    userId: userId,
                    $and: promises
                }
            },
            {
                $project: { _id: 1 }
            },

            {
                $group: {
                    _id: "",
                    ids: { $addToSet: "$_id" }
                }
            },
            {
                $project: { _id: 0 }
            },

            ])
            leadData = leadData.ids
        } else {
            leadData = []
        }
        if (membership_status) {
            var [membershipData] = await membership.aggregate([{
                $match: { userId: userId, membership_status: { $in: membership_status } }
            }, {
                $project: {
                    studentInfo: 1,
                    membership_status: 1
                }
            }, { $unwind: "$studentInfo" },
            {
                $lookup: {
                    from: "members",
                    localField: "studentInfo",
                    foreignField: "_id",
                    as: "data"
                }
            },
            {
                $project: {
                    data: "$data._id",
                    _id: 0,

                }
            },
            { $unwind: "$data" },
            {
                "$group": {
                    "_id": "",
                    "ids": { "$addToSet": "$data" }
                }
            },
            {
                $project: {
                    _id: 0,
                }
            },
            ])

            if (membershipData.ids.length) {
                membershipData = membershipData.ids
                if (leadData.length) {
                    leadData = leadData.filter(e => {
                        return membershipData.some(item => String(item) === String(e));
                    })
                } else {
                    leadData = []
                }
            }
        }
        if (finance) {
            if (finance.includes('expired')) {
                var financeData = await financeInfo.aggregate(
                    [{
                        $match: {
                            userId: userId
                        }
                    },
                    {
                        $project: {
                            studentId: 1,
                            expiry_date: 1,
                            month: { $month: "$$NOW" },
                            year: { $toInt: { $substrBytes: [{ $toString: { $year: "$$NOW" } }, 2, -1] } },
                            expired_month: { $toInt: { $substrBytes: ["$expiry_date", 0, 2] } },
                            expired_year: { $toInt: { $substrBytes: ["$expiry_date", 2, -1] } },

                        }
                    },
                    {
                        $addFields: {
                            studentId: { $convert: { input: '$studentId', to: 'objectId', onError: '', onNull: '' } }
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            localField: "studentId",
                            foreignField: "_id",
                            as: "data"
                        }
                    },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $gte: ["$year", "$expired_year"] },
                                    { $gte: ["$month", "$expired_month"] }
                                ]
                            },
                        }
                    },
                    {
                        $project: {
                            data: "$data._id",
                            _id: 0,

                        }
                    },

                    { $unwind: "$data" },
                    {
                        "$group": {
                            "_id": "",
                            "data": { "$addToSet": "$data" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                        }
                    },
                    ]
                )
                financeData = financeData.data ? financeData.data : []
            }
            if (finance.includes('not_expired')) {
                let not_expiredFinance = await financeInfo.aggregate(
                    [{
                        $match: {
                            userId: userId
                        }
                    },
                    {
                        $project: {
                            studentId: 1,
                            expiry_date: 1,
                            month: { $month: "$$NOW" },
                            year: { $toInt: { $substrBytes: [{ $toString: { $year: "$$NOW" } }, 2, -1] } },
                            expired_month: { $toInt: { $substrBytes: ["$expiry_date", 0, 2] } },
                            expired_year: { $toInt: { $substrBytes: ["$expiry_date", 2, -1] } },
                        }
                    },
                    {
                        $addFields: {
                            studentId: { $convert: { input: '$studentId', to: 'objectId', onError: '', onNull: '' } }
                        }
                    },
                    {
                        $lookup: {
                            from: "members",
                            localField: "studentId",
                            foreignField: "_id",
                            as: "data"
                        }
                    },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $gt: ["$expired_year", "$year"] },
                                ]
                            },
                        }
                    },
                    {
                        $project: {
                            data: "$data._id",
                            _id: 0

                        }
                    },

                    { $unwind: "$data" },
                    {
                        "$group": {
                            "_id": "",
                            "data": { "$addToSet": "$data" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                        }
                    },
                    ]
                )
                if (financeData) {
                    financeData.push(...not_expiredFinance[0].data)
                } else {
                    financeData = [...not_expiredFinance[0].data]
                }
            }
            if (leadData.length) {
                leadData = leadData.filter(e => {
                    return financeData.some(item => String(item) === String(e));
                })
            } else {
                leadData = []
            }
        }

        if (renewal) {
            var renewalData = await buymembership
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

                    { $match: { days_till_Expire: { $lte: renewal[0], $gt: 0 } } },
                    {
                        $project: {
                            data: "$data._id",
                            _id: 0

                        }
                    },

                    { $unwind: "$data" },
                    {
                        "$group": {
                            "_id": "",
                            "data": { "$addToSet": "$data" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                        }
                    },
                ])
            if (renewalData.length) {
                renewalData = renewalData[0].data
                if (leadData.length) {
                    leadData = leadData.filter(e => {
                        return renewalData.some(item => String(item) === String(e));
                    })
                } else {
                    leadData = []
                }
            }
        }
        await smartlist.findByIdAndUpdate(slId, {
            smartlistname: req.body.smartlistname,
            smartlists: leadData,
            criteria: req.body.criteria
        },
            ((err, leads_data) => {
                if (err) {
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "smartlist updated successfully", success: true });
                }
            }))
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

exports.delete_smart_list = async (req, res) => {
    try {
        let slId = req.params.slId
        if (!slId) {
            res.json({
                success: false,
                msg: "Please give the leadsId  in params!"
            })
        }
        await smartlist.findByIdAndRemove(slId, req.body,
            ((err, leads_data) => {
                if (err) {
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "smartlist deleted successfully", success: true });
                }
            }))
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

