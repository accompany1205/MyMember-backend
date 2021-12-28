const smartlist = require('../models/smartlists')
const member = require('../models/addmember')
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
        let { membership_status, finance } = req.body.criteria
        let promises = [];
        let obj = req.body.criteria
        for (const i in obj) {
            if (obj[i].length && i !== "membership_status" && i !== "finance") {
                promises.push({ [i]: { $in: obj[i] } })
            }
        }
        Promise.all(promises);
        var leadData = await member.find({
            userId: userId,
            $and: promises
        }, { email: 1 })
        if (membership_status) {
            var membershipData = await membership.aggregate([{
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
                    membership_status: 1,
                    "data._id": 1,
                    "data.email": 1,
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
            ])
            membershipData = membershipData[0].data
            leadData = leadData.filter(e => {
                return !membershipData.some(item => item._id === e._id);
            });
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
                            "data._id": 1,
                            "data.email": 1,
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
                financeData = financeData[0].data
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
                            "data._id": 1,
                            "data.email": 1,
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
                if (financeData) {
                    financeData.push(...not_expiredFinance[0].data)
                } else {
                    financeData = [...not_expiredFinance[0].data]
                }
            }
        

            console.log(inBoth(financeData, leadData))
            var arr1 = financeData.filter(e => {
                return !leadData.some(item => item._id === e._id);
            });
            console.log("arr1", arr1)
        }

        // let sldata = smartlist({
        //     smartlistname: req.body.smartlistname,
        //     smartlists: arr,
        //     userId: userId
        // })

        // sldata.save((err, sldata) => {
        //     if (err) {
        //         res.send({ error: err.message.replace(/\"/g, ""), success: false });

        //     } else {
        //         return res.send({ msg: sldata, success: true });

        //     }
        // })
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
        let { membership_status } = req.body.criteria
        let promises = [];
        let obj = req.body.criteria
        for (const i in obj) {
            if (obj[i].length && i !== "membership_status") {
                promises.push({ [i]: { $in: obj[i] } })
            }
        }
        Promise.all(promises);
        let leadData = await member.find({
            userId: userId,
            $and: promises
        }, { email: 1 })

        if (membership_status.length) {
            var membershipData = await membership.aggregate([{
                $match: { userId: userId, membership_status: { $in: membership_status } }
            }, {
                $project: {
                    studentInfo: 1,
                    membership_status: 1
                }
            }, { $unwind: "$studentInfo" }, {
                $lookup: {
                    from: "members",
                    localField: "studentInfo",
                    foreignField: "_id",
                    as: "data"
                }
            },
            {
                $project: {
                    membership_status: 1,
                    "data._id": 1,
                    "data.email": 1,
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
            ])
            membershipData = membershipData[0].data
            var arr = leadData.filter(e => {
                return !membershipData.some(item => item._id === e._id);
            });
        }
        await smartlist.findByIdAndUpdate(slId, {
            smartlistname: req.body.smartlistname,
            smartlists: arr
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

