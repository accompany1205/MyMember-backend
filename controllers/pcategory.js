const pcategory = require("../models/pcategory");
const program = require("../models/program");

exports.read = (req, res) => {
    var categoryId = req.params.categoryId;
    pcategory.findById(categoryId)
        .populate('program_subcategory')
        .exec((err, data) => {
            if (err) {
                res.send({ error: 'subcategory is not populate' })
            }
            else {
                res.send(data)
            }
        })
}

exports.catList = (req, res) => {
    // {userId:req.params.userId}
    pcategory.find()
        .populate('program_subcategory')
        .exec((err, catlist) => {
            if (err) {
                res.send({ error: 'program category list not found' })
            }
            else {
                res.send(catlist)
            }
        })
}

exports.create = async (req, res) => {
    try {
        const categoryDetails = req.body
        categoryDetails.userId = req.params.userId;
        categoryDetails.adminId = req.params.adminId;
        let isExist = await program.find({ programName: categoryDetails.programName })
        if (isExist.length) {
            var categoryObj = new pcategory(categoryDetails)
            categoryObj.save((err, categoryData) => {
                if (err) {
                    res.send({ msg: err, success: false })
                }
                else {
                    program.updateOne({ programName: categoryDetails.programName }, { $push: { program_category: categoryData._id } })
                        .exec((err, data) => {
                            if (err) {
                                res.send({ msg: err, success: false })
                            }
                            else {
                                res.send({ msg: 'Category added successfully', category: categoryData })
                            }
                        })
                }
            })
        }
        else {
            res.send({ msg: "Program does not exist!", success: false })
        }
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}



exports.update = async (req, res) => {
    const categoryDetails = req.body
    var categoryId = req.params.categoryId
    const adminId = req.params.adminId
    const userId = req.params.userId;
    try {
        let isExist = await program.find({ programName: categoryDetails.programName })
        if (isExist.length) {
            await pcategory.updateOne({ _id: categoryId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: categoryDetails })
                .exec((err, data) => {
                    if (err) {
                        res.send({ msg: err, success: false })
                    }
                    else {
                        if (data.n < 1) {
                            return res.status(401).send({
                                msg: "This is system generated Category Only admin can update",
                                success: false,
                            });
                        }
                        res.send({ msg: 'Category updated successfully', success: true })
                    }
                })
        }
        else {
            res.send({ msg: "Program does not exist!", success: false })
        }
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.remove = async (req, res) => {
    var categoryId = req.params.categoryId;
    const adminId = req.params.adminId
    const userId = req.params.userId;
    try {
        pcategory.remove({ _id: categoryId, $and: [{ userId: userId }, { adminId: adminId }] },
            (err, data) => {
                if (err) {
                    res.send({ msg: err, success: false })
                }
                else {
                    if (!data) {
                        return res.status(401).send({
                            msg: "This is system generated Category Only admin can delete",
                            success: false,
                        });
                    }
                    program.updateOne({ "program_category": categoryId }, { $pull: { "program_category": categoryId } },
                        function (err, data) {
                            if (err) {
                                res.send({ msg: 'Category  removed successfully', success: false })
                            }
                            else {
                                res.send({ msg: "Category removed successfully", success: true })
                            }
                        })
                }
            })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}






