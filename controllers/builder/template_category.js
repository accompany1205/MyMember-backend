const TemplateCategory = require('../../models/builder/template_category');
const TemplateCategoryType = require('../../models/builder/template_category_type');
const Template = require('../../models/builder/template');
const { errorHandler } = require('../../helpers/dbErrorHandler');

exports.categoryById = (req, res, next, id) => {
    TemplateCategory.findById(id).exec((err, category) => {
        if (err || !category) {
            return res.status(400).json({
                error: 'Category does not exist'
            });
        }
        req.category = category;
        next();
    });
};

exports.create = (req, res) => {
    const payload = req.body;

    payload.userId = req.params.userId;
    payload.adminId = req.params.adminId;
    console.log(payload);
    const category = new TemplateCategory(payload);
    category.save((err, data) => {
        console.log(data);
        console.log(err);
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        //new
        res.json({ data });
    });
};

exports.read = (req, res) => {
    return res.json(req.category);
};

exports.update = (req, res) => {

    TemplateCategory
        .findByIdAndUpdate(req.params.categoryId, { $set: req.body })
        .then(() => {
            res.send({
                msg: "Appointment has been updated successfully!",
                success: true,
            });
        })
        .catch((err) => {
            res.send({ msg: "Event not updated please try again!", success: false });
        });
};

exports.remove = (req, res) => {

    Template.find({ categoryId: req.params.categoryId }).exec((err, data) => {
        if (data.length >= 1) {
            return res.status(400).json({
                message: `Sorry. You cant delete ${category.name}. It has ${data.length} associated products.`
            });
        } else {
            TemplateCategory.remove({_id:req.params.categoryId}).exec((err,resp) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({
                    message: 'Category deleted'
                });
            });
        }
    });
};

exports.list = (req, res) => {
    TemplateCategory.aggregate([
        {
            $lookup: {
                from: "template_category_types",
                localField: "typeId",
                foreignField: "_id",
                as: "type",
            },
        },
    ]).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            categories: data
        })

    });
};


exports.typeList = (req, res) => {
    TemplateCategoryType.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.status(200).json({
            success: true,
            message: "Category List fetched successfully",
            types: data
        })

    });
};
