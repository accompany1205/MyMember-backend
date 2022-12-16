const Form = require("../../models/builder/Form.js")
const TemplateCategory = require("../../models/builder/template_category.js")
const Template = require("../../models/builder/template.js")
const mongoose = require("mongoose")
const cloudUrl = require('../../gcloud/imageUrl');

const checkTemplateId = async (templateId) => {
    try {
        let template = await Template.findOne({ _id: templateId });
        if (template) {
            return template;
        }
        return false;
    } catch (err) {
        console.log(err);
    }
}

exports.createForm = async (req, res) => {
    try {
        let templateId = req.body.templateId;
        let template = await checkTemplateId(templateId);
        if (!template) {
            return res.send({ msg: "Incorrect template Id!", success: false });
        }
        let formBody = "<html></html>"

        let created_by = new mongoose.Types.ObjectId
        let newTemplateId = mongoose.Types.ObjectId(templateId)
        let form = new Form
        form.title = req.body.title;
        form.formBody = formBody
        form.created_by = created_by
        form.templateId = newTemplateId
        form.formData = JSON.stringify({
            "gjs-css": "",
            "gjs-html": "",
            "gjs-assets": "[]",
            "gjs-styles": "",
            "gjs-components": "[ {\"tagName\":\"h1\",\"type\":\"text\",\"attributes\":{\"id\":\"imc6s\"},\"components\":[ {\"type\":\"textnode\",\"content\":\"Form\"} ]}]"
        })
        //'{{"tagName":"h5","type":"text","attributes":{"id":"imc6s"},"components":[{"type":"textnode","content":"Form"}]}}'
        await form.save();
        //console.log(data)
        await Template.updateOne({_id:newTemplateId},{$push:{forms:mongoose.Types.ObjectId(form._id)}})
        res.status(200).json({
            success: true,
            message: "Form created successfully",
            formId: form._id,
            data: "data test"
        })
    }
    catch (error) {
        console.log("Error:", error)
        res.status(500).json({
            success: false,
            message: "Error creating form"
        })
    }
}

exports.deleteForm = async (req, res) => {
    try {
        let formId = req.params.id;
        formId = mongoose.Types.ObjectId(formId)
        let form = await Form.findOne({ _id: formId });
        let templateId = mongoose.Types.ObjectId(form.templateId);
        await Template.updateOne({_id:templateId},{ $pull: { 'forms':formId } });
        await form.delete()
        res.status(200).json({
            success: true,
            message: "Form deleted successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting form"
        })
    }
}

exports.createTemplate = async (req, res) => {
    let userId = req.params.userId;
    if (!userId) {
        return res.send({ success: false, msg: "specify school!" });
    }
    try {
        const data = req.body;
        data.userId = userId;
        if (req.file) {
            data.thumbnail = await cloudUrl.imageUrl(req.file);
        }
        let template = new Template(data);
        await template.save();
        res.status(200).json({
            success: true,
            message: "Template created successfully",
            templateId: template._id,
            data: "data test"
        })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false })
    }
}

exports.getDetailTemplate = async (req, res) => {
    let templateId = req.params.templateId;
    if (!templateId) {
        return res.send({ success: false, msg: "No funnel id!" });
    }
    try {
        let data = await Template.findOne({ _id: templateId, isDeleted: false }).populate('forms');
        if (!data) {
            return res.send({ msg: "No Funnel", success: true });
        }
        res.send({ data: data, msg: "data!", success: true });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false })
    }
}

exports.getTemplates = async (req, res) => {
    let userId = req.params.userId;
    if (!userId) {
        return res.send({ success: false, msg: "specify school!" });
    }
    try {
        const count = await Template.find({ userId: userId, isDeleted: false }).countDocuments();
        var per_page = parseInt(req.params.per_page) || 5;
        var page_no = parseInt(req.params.page_no) || 0;
        var pagination = {
            limit: per_page,
            skip: per_page * page_no,
        };
        Template.aggregate([
            {
                $lookup: {
                    from: "template_categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $match: {userId: userId, isDeleted: false}
            }
        ]).sort({
                createdAt: -1,
            })
            .skip(pagination.skip)
            .limit(pagination.limit)
            .exec((err, data) => {
                if (err) {
                    res.send({
                        msg: "Template data is not find",
                        success: false,
                    });
                } else {
                    res.send({ data, totalCount: count, success: true });
                }
            });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false })
    }
}

exports.updateTemplate = async (req, res) => {
    let templateId = req.params.templateId;
    let userId = req.params.userId;
    if (!userId || !templateId) {
        return res.send({ success: false, msg: "No template/school id!" });
    }
    try {
        let body = req.body;
        let formId = req.body.formId;
        if (body.formId) {
            body.formId = ObjectId(formId);
        }
        let data = await Template.updateOne({ _id: templateId }, { $set: body });
        if (data.nModified < 1) {
            res.send({ msg: "not Updated!", success: false });
        }
        res.send({ msg: "Updated Funnel!", success: true })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false })
    }
}

exports.deletedTemplate = async (req, res) => {
    let templateId = req.params.templateId;
    try {
        let deleted = await Template.updateOne({ _id: templateId }, { $set: { isDeleted: true } });
        if (deleted.nModified < 1) {
            return res.send({ msg: "Not Deleted!", success: false });
        }
        res.send({ success: true, msg: "Deleted!" })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false })
    }
}
