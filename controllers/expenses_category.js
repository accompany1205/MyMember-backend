const expenses = require("../models/expenses");
const expenses_category = require("../models/expenses_category");
const totalExp = require("../models/totalExp");
var mongo = require("mongoose")

exports.create = (req, res) => {
    const userID = req.params.userId;
    const adminID = req.params.adminId;
    const expCategoryBody = new expenses_category({
        expense_category_type: req.body.expense_category_type,
        color: req.body.color,
        userId: userID,
        adminId: adminID
    })
    expCategoryBody.save((err, data) => {
        if (err) {
            res.send({ msg: 'expenses category is not add', success: false })
        }
        else {
            res.send({ msg: "Expense Category Added", success: true })
        }
    })
}

exports.read = (req, res) => {
    let adminId = process.env.ADMINID
    const userId = req.params.userId;
    expenses_category
        .find({ $or: [{ userId: userId }, { adminId: adminId }] })
        .select('expense_category_type')
        .select('color')
        .exec((err, categoryList) => {
            if (err) {
                res.send({ msg: 'category list not found', success: false })
            }
            else {
                res.send(categoryList)
            }
        })
}

exports.getadminCategory = async (req, res) => {
    const adminId = req.params.adminId;
    await expenses_category
        .find({ adminId: adminId })
        .select('expense_category_type')
        .select('color')
        .exec((err, folder) => {
            if (err) {
                res.send({ msg: "category list not found", success: false });
            } else {
                res.status(200).send({
                    data: folder,
                    success: true,
                });
            }
        });
};

exports.category_total = (req, res) => {
    var userID = mongo.Types.ObjectId(req.params.userId)
    expenses_category.aggregate([
        { "$match": { userId: userID } },
        {
            "$group": {
                "_id": "$userId",
                "totalexp": {
                    $sum: {
                        $sum: "$expenses.amount"
                    }
                },
            }
        },
        {
            "$lookup": {
                from: 'expenses',
                as: "data",
                pipeline: [{ $match: { $expr: { $eq: ['$userId', userID] } } }]
            }
        },
        {
            "$project": {
                data: 1,
                totalexp: 1
            }
        }
    ]).exec((err, data) => {
        if (err) {
            res.send({ error: 'list not found' })
        }
        else {
            res.send(data)
        }
    })
}

exports.info_category = (req, res) => {
    expenses_category.findById(req.params.categoryId)
        .exec((err, category_info) => {
            if (err) {
                res.send({ error: 'category info is not found' })
            }
            else {
                res.send(category_info)
            }
        })
}

exports.update_category = (req, res) => {
    const adminId = req.params.adminId
    const userId = req.params.userId;
    const categoryId = req.params.categoryId;
    expenses_category
        .updateOne({ _id: categoryId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
        .exec((err, updatecat) => {
            if (err) {
                res.send({ msg: 'expense category not updated', success: false })
            }
            if (updatecat.n < 1) {
                return res.send({
                    msg: "This is system generated folder Only admin can update",
                    success: false,
                });
            }
            res.send({ msg: 'expense category updated successfully', success: true })

        })
}

exports.remove_category = (req, res) => {
    try {

        expenses_category.findByIdAndRemove({ _id: req.params.categoryId })
            .exec((err, removeCat) => {
                if (err) {
                    res.send({ msg: 'category is not remove', success: false })
                }
                else {
                    if (!removeCat) {
                        return res.send({ msg: 'category remove successfully', success: true })

                    }
                    let catName = removeCat.expense_category_type
                    let userId = removeCat.userId
                    let adminId = removeCat.adminId
                    expenses.deleteMany({ $and: [{ "category": catName, "userId": userId, adminId: adminId }] },
                        (err, allDelExp) => {
                            if (err) {
                                res.send({ msg: 'category of expense is not remove', success: false })
                            }
                            else {
                                res.send({ msg: 'category remove successfully', success: true })
                            }
                        })

                }
            })

    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false });

    }
}