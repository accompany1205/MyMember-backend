const Form = require("../../models/builder/Form.js")
const emoloyeeForm = require('../../models/employeeForm')
const addmember = require("../../models/addmember.js")
const Task = require('../../models/task')
const Funnel = require("../../models/builder/funnel.js")
const sub_users_role = require("../../models/sub_user_roles")
const FunnelContact = require("../../models/funnelContact.js");
const userSectionFiles = require("../../models/userSectionFiles")
const user = require("../../models/user")
const roleList = require("../../models/rolesList")
const mongoose = require("mongoose")

//const stripe = require('stripe')('sk_test_v9')
const config = require('../../config/stripe');
const stripe = require('stripe')(config.secretKey);
const httpBuildQuery = require('http-build-query');

const getToken = async (code) => {
    let token = {};
    try {
        token = await stripe.oauth.token({ grant_type: 'authorization_code', code });
    } catch (error) {
        token.error = error.message;
    }
    return token;
}

const getAccount = async (connectedAccountId) => {
    let account = {};
    try {
        account = await stripe.account.retrieve(connectedAccountId);
    } catch (error) {
        account.error = error.message;
    }
    return account;
}

exports.processStripeConnect = async (req, res) => {



    const account = await stripe.accounts.create({ type: 'standard' });

    /*
    const result = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code: req.query.code
    })
    .catch((err) => {

    })
    const account = await stripe.accounts?.retrieve(result?.stripe_user_id)
    ?.catch((err)=>{
        throw error(400, `${err?.message}`)
    })
    */
    let return_url = `${process.env.BASE_URL}/`
    let refresh_url = `${process.env.BASE_URL}/`

    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: refresh_url,
        return_url: return_url,
        type: 'account_onboarding'
    })

    let url = accountLink.url

}

exports.getIntentClientSecret = async (req, res) => {

    try {

        let amount = 0
        let currency = 'eur'
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            application_fee_amount: 123,
        }, {
            stripeAccount: '{{CONNECTED_ACCOUNT_ID}}',
        });

        res.status(200).json({ client_secret: paymentIntent.client_secret, success: true });

    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({
            success: false
        })
    }

}

const checkFunnelId = async (funnelId) => {
    try {
        let funnel = await Funnel.findOne({ _id: funnelId });
        if (funnel) {
            return funnel;
        }
        return false;
    } catch (err) {
        console.log(err);
    }

}

async function contactCreate(body, formData) {
    let contactInfo = body;
    contactInfo.userId = mongoose.Types.ObjectId(formData.userId);
    contactInfo.formId = mongoose.Types.ObjectId(formData._id);
    contactInfo.funnelId = mongoose.Types.ObjectId(formData.funnelId)
    let studentInfo = new FunnelContact(contactInfo);
    await studentInfo.save();
}

exports.saveFunnelContact = async (req, res) => {
    const formId = req.params.formId;
    if (!formId) {
        return res.send({ success: false, msg: "not valid form!" });
    }
    try {
        let formData = await Form.findOne({ _id: formId });
        console.log(formData)
        let funneldata = await Funnel.findOne({ _id: formData.funnelId });
        if (funneldata.isAutomation) {
            let memberdata = req.body
            memberdata.userId = formData.userId;
            let studentData = addmember(memberdata)
            await studentData.save();
            await contactCreate(memberdata, formData)
            return res.send({ success: true, msg: "Submitted !" })
        }
        await contactCreate(memberdata)
        return res.send({ success: true, msg: "Submitted !" })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false })
    }
}

exports.getFunnelContact = async (req, res) => {
    const funnelId = req.params.funnelId;
    let funnel = await checkFunnelId(funnelId);
    if (!funnel) {
        return res.send({ success: false, msg: "not valid funnelId!" });
    }
    try {
        const count = await FunnelContact.find({ funnelId: funnelId, isDeleted: false }).countDocuments();
        var per_page = parseInt(req.params.per_page) || 5;
        var page_no = parseInt(req.params.page_no) || 0;
        var pagination = {
            limit: per_page,
            skip: per_page * page_no,
        };
        FunnelContact.find({ funnelId: funnelId, isDeleted: false })
            .sort({
                createdAt: -1,
            })
            .limit(pagination.limit)
            .skip(pagination.skip)
            .exec((err, memberdata) => {
                if (err) {
                    res.send({
                        msg: "member data is not find",
                        success: false,
                    });
                } else {
                    res.send({ memberdata, totalCount: count, success: true });
                }
            });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false })
    }
}

exports.createForm = async (req, res) => {
    try {
        let funnelId = req.body.funnelId;
        let userId = req.params.userId;
        let funnel = await checkFunnelId(funnelId);
        if (!funnel) {
            return res.send({ msg: "Incorrect funnel Id!", success: false });
        }
        let formBody = "<html></html>"
        //let title = "Form Title"
        let created_by = new mongoose.Types.ObjectId
        let newFunnelId = mongoose.Types.ObjectId(funnelId)
        let form = new Form
        form.title = req.body.title
        form.formBody = formBody
        form.created_by = created_by
        form.funnelId = newFunnelId
        form.userId = userId;
        form.formData = JSON.stringify({
            "gjs-css": "",
            "gjs-html": "",
            "gjs-assets": "[]",
            "gjs-styles": "",
            "gjs-components": "[]"
        })
        //'{{"tagName":"h5","type":"text","attributes":{"id":"imc6s"},"components":[{"type":"textnode","content":"Form"}]}}'
        await form.save();
        //console.log(data)
        if (funnel.forms.length === 0) {
            await Funnel.updateOne({ _id: funnelId }, { $push: { forms: mongoose.Types.ObjectId(form._id) } });
        } else {
            await Funnel.updateOne({ _id: newFunnelId }, { $push: { forms: mongoose.Types.ObjectId(form._id) } })
        }
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



exports.markAsFavourite = async (req, res) => {
    try {
        let formId = req.params.id
        console.log("formId::", formId)
        let form = await Form.findOne({ _id: formId })
        form.favourite = !form.favourite
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form updated successfully"
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating form"
        })
    }
}

exports.getFavourites = async (req, res) => {
    try {
        let forms = await Form.find({ favourite: true })

        res.status(200).json({
            success: true,
            message: "Favourite forms fetched successfully",
            forms: forms
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error marking form as favourite"
        })
    }
}

exports.moveToTrash = async (req, res) => {
    try {

        let formId = req.params.id
        let form = await Form.findOne({ _id: formId })
        form.deleted = !form.deleted
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form deleted successfully"
        })
    }
    catch (error) {
        console.log("mtt:", error)
        res.status(500).json({
            success: false,
            message: "Error deleting form"
        })
    }
}

exports.deleteForm = async (req, res) => {
    try {
        let formId = req.params.id;
        formId = mongoose.Types.ObjectId(formId)
        let form = await Form.findOne({ _id: formId });
        let funnelId = mongoose.Types.ObjectId(form.funnelId);
        await Funnel.updateOne({ _id: funnelId }, { $pull: { 'forms': formId } });

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

exports.archiveForm = async (req, res) => {
    try {
        let formId = req.params.id

        let form = await Form.findOne({ _id: formId })
        form.archived = !form.archived
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form updated successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating form"
        })
    }
}

exports.updateFormData = async (req, res) => {
    try {
        let formId = req.params.id
        let update = { html: req.body.html, css: req.body.css, js: req.body.js, data: req.body.data }
        console.log("formId-2-settings:", formId)

        let form = await Form.findOne({ _id: formId })

        form.formBody = req.body.html
        form.formStyle = req.body.css
        form.formScript = req.body.js
        form.formData = req.body.data
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form updated successfully"
        })

    }
    catch (error) {

        res.status(500).json({
            success: false,
            message: "Error updating form"
        })
    }
}

exports.updateFormSettings = async (req, res) => {
    try {
        let formId = req.params.id
        let update = { title: req.body.title, enable: req.body.enabled }
        console.log("updateSettings:", formId, update)
        let enabled = null;
        if (req.body.enabled == "enabled") {
            enabled = true
        } else {
            enabled = false
        }

        let form = await Form.findOne({ _id: formId })
        form.title = req.body.title
        form.enabled = enabled
        await form.save()

        res.status(200).json({
            success: true,
            message: "Form updated successfully"
        })

    }
    catch (error) {
        console.log("uError:", error)
        res.status(500).json({
            success: false,
            message: "Error updating form"
        })
    }
}



exports.getForms = async (req, res, next) => {
    try {
        let uforms = await Form.find()
        //console.log("getForms:", uforms)
        if (uforms) {
            res.status(200).json({
                success: true,
                message: "Forms fetched successfully",
                uforms: uforms
            })
        }
    }
    catch (error) {
        console.log("error:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching forms"
        })
    }
}

exports.storeForm = async (req, res, next) => {
    try {
        console.log("storeForm-1:::", req.body)
        res.status(200).json({ test: "store form" })
    }
    catch (error) {
        console.log("storeForm::", error)
        res.status(500).json({
            success: false,
            message: "Error storing form"
        })
    }
}

exports.loadForm = async (req, res, next) => {
    try {
        console.log("loadForm:::", req.body)
        res.status(200).json({ test: "load form" })
    }
    catch (error) {
        console.log("loadForm::", error)
        res.status(500).json({
            success: false,
            message: "Error loading form"
        })
    }
}

exports.getForm = async (req, res, next) => {
    try {
        let formId = req.params.id
        let uform = await Form.findOne({ _id: formId })
        if (uform) {
            res.status(200).json({
                success: true,
                message: "Form fetched successfully",
                uform: uform
            })
        }
    }
    catch (error) {
        console.log("error:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching form:id"
        })
    }
}


exports.processForm = async (req, res) => {

    try {
        console.log("Processing Form")
        console.log("Req.body::", req.body)

        let formId = req.params.id
        let userId = req.params.userId

        //Contact Info
        let memberType = req.body.member_type
        let memberId = req.body.memberId

        // Member Info
        let firstName = req.body.first_name
        let lastName = req.body.last_name
        let gender = req.body.gender
        let dob = req.body.dob
        let age = req.body.age
        let street = req.body.street
        let city = req.body.city
        let state = req.body.state
        let zipCode = req.body.zipcode
        let country = req.body.country
        let phone1 = req.body.phone
        let phone2 = req.body.phone2
        let email = req.body.email

        //Buyer Info
        let buyerFirstName = req.body.first_name2
        let buyerLastName = req.body.last_name2
        let buyerGender = req.body.gender2
        let buyerDob = req.body.dob2
        let buyerAge = req.body.age2

        //custom info
        let leadsTracing = req.body.leads

        let form = await Form.findOne({ _id: formId })
        form.submission += 1
        await form.save()

        let newmember = await addmember
        newmember.studentType = memberType
        newmember.firstName = firstName
        newmember.lastName = lastName
        newmember.dob = dob
        newmember.age = age
        newmember.gender = gender
        newmember.email = email
        newmember.primaryPhone = phone1
        newmember.secondaryPhone = phone2
        newmember.street = street
        newmember.city = city
        newmember.state = state
        newmember.country = country
        newmember.zipPostalCode = zipCode

        newmember.buyerInfo.firstName = buyerFirstName
        newmember.buyerInfo.lastName = buyerLastName
        newmember.buyerInfo.gender = buyerGender
        newmember.buyerInfo.dob = buyerDob
        newmember.buyerInfo.age = buyerAge

        await newmember.save()
    } catch (error) {
        console.log("Err:", error)
    }

}

const checkSbUserIdId = async (funnelId) => {
    try {
        let subUsersRole = await sub_users_role.findOne({ _id: funnelId });
        if (subUsersRole) {
            return subUsersRole;
        }
        return false;
    } catch (err) {
        console.log(err);
    }

}

exports.createDigitalForm = async (req, res) => {
    let userId = req.params.userId;
    let subUserId = req.body.subUserId;
    let formType = req.body.form
    let subUser = await checkSbUserIdId(subUserId);
    if (!subUser) {
        return res.send({ msg: "Incorrect subuser Id!", success: false });
    }
    try {
        if (formType == "document") {
            let data = await roleList.aggregate([
                {
                    $match: {
                        userId: userId,
                        documentId: { $ne: [] }
                    }
                },
                {
                    $project: {
                        documentId: 1
                    }
                },
                {
                    $unwind: "$documentId"
                },
                {
                    $lookup: {
                        from: "usersectionfiles",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "documentData"
                    }
                },
                {
                    $unwind: "$documentData"
                }
            ])
            data.map(async (ele) => {
                let documentForm = new userSectionFiles
                documentForm.fileName = ele.documentData.fileName
                documentForm.SettingFile = ele.documentData.SettingFile
                documentForm.fileType = ele.documentData.fileType
                documentForm.studentId = ele.documentData.studentId
                documentForm.userId = ele.documentData.userId
                documentForm.description = ele.documentData.description

                await documentForm.save();
                await sub_users_role.updateOne({ _id: subUserId }, { $push: { documentId: mongoose.Types.ObjectId(documentForm._id) } })

            })
            res.status(200).json({
                success: true,
                message: "Document Form created successfully",
                data: "data test"
            })
        } else if (formType == "digital") {
            let data = await roleList.aggregate([
                {
                    $match: {
                        userId: userId,
                        digitalId: { $ne: [] }
                    }
                },
                {
                    $project: {
                        digitalId: 1
                    }
                },
                {
                    $unwind: "$digitalId"
                },
                {
                    $lookup: {
                        from: "Form",
                        localField: "digitalId",
                        foreignField: "_id",
                        as: "digitalData"
                    }
                },
                {
                    $unwind: "$digitalData"
                }
            ])
            data.map(async (ele) => {
                let employee_form = new emoloyeeForm
                employee_form.title = ele.digitalData.title
                employee_form.formBody = ele.digitalData.formBody
                employee_form.created_by = mongoose.Types.ObjectId(ele.digitalData.created_by)
                employee_form.userId = ele.digitalData.userId
                employee_form.formData = ele.digitalData.formData
                await employee_form.save();
                await sub_users_role.updateOne({ _id: subUserId }, { $push: { digitalId: mongoose.Types.ObjectId(employee_form._id) } });

            })
            res.status(200).json({
                success: true,
                message: "Digital Form created successfully",
                data: "data test"
            })
        } else if (formType == "task") {
            let data = await roleList.aggregate([
                {
                    $match: {
                        userId: userId,
                        digitalId: { $ne: [] }
                    }
                },
                {
                    $project: {
                        taskId: 1
                    }
                },
                {
                    $unwind: "$taskId"
                },
                {
                    $lookup: {
                        from: "Form",
                        localField: "taskId",
                        foreignField: "_id",
                        as: "taskData"
                    }
                }
            ])
            data.map(async (ele) => {
                let task = new Task
                task.name = ele.taskData.name
                task.assign = ele.taskData.assign
                task.type = ele.taskData.type
                task.interval = ele.taskData.interval
                task.range = ele.taskData.range
                task.start = ele.taskData.start
                task.end = ele.taskData.end
                task.start_time = ele.taskData.start_time
                task.end_time = ele.taskData.end_time
                task.repeatedDates = ele.taskData.repeatedDates
                task.repeatedConcurrence = ele.taskData.repeatedConcurrence
                task.label = ele.taskData.label
                task.due_date = ele.taskData.due_date
                task.priority = ele.taskData.priority
                task.isproof = ele.taskData.isproof
                task.isproof = ele.taskData.isproof
                task.document = ele.taskData.document
                task.isEnterData = ele.taskData.isEnterData
                task.description = ele.taskData.description
                task.isRating = ele.taskData.isRating
                task.rating = ele.taskData.rating
                task.isYesOrNo = ele.taskData.isYesOrNo
                task.isYesOrNo = ele.taskData.isYesOrNo
                task.yesOrNo = ele.taskData.yesOrNo
                task.status = ele.taskData.status
                taak.userId = ele.taskData.status
                task.subfolderId = ele.taskData.status
                task.isSeen = ele.taskData.isSeen
                task.isRead = ele.taskData.isSeen
                await task.save();
                await sub_users_role.updateOne({ _id: subUserId }, { $push: { digitalId: mongoose.Types.ObjectId(task._id) } });
            })
            res.status(200).json({
                success: true,
                message: "Digital Form created successfully",
                data: "data test"
            })
        }

    }
    catch (error) {
        console.log("Error:", error)
        res.status(500).json({
            success: false,
            message: "Error creating form"
        })
    }
}
