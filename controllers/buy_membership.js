const membershipModal = require("../models/membership");
const buyMembership = require("../models/buy_membership");
const AddMember = require("../models/addmember")
var addmemberModal = require('../models/addmember')
const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash')
const Joi = require('@hapi/joi')


exports.membership_Info = (req, res) => {
    const id = req.params.membershipId
    buy_membership.findById(id)
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.update = (req, res) => {
    // const id = req.params.membershipId;
    // console.log(id,req.body)
    buyMembership.findByIdAndUpdate(req.params.membershipId, req.body)
        .then((update_resp) => {
            console.log(update_resp)
            res.send(update_resp)
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
};

exports.remove = (req, res) => {
    const id = req.params.membershipId
    buyMembership.deleteOne({ _id: id })
        .then((resp) => {
            addmemberModal.update({ "membership_details": id }, { $pull: { "membership_details": id } }
                , function (err, data) {
                    if (err) {
                        res.send({ error: "mebership is not delete in student" });
                        console.log(err)
                    }
                    else {
                        res.send({ msg: "mebership is delete in student" });
                    }
                })
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
};


exports.create = async (req, res)  => {
    var studentId = req.params.studentId;
    var Id = { userId: req.params.userId }

    let buyMembershipSchema = Joi.object({
        student_name : Joi.string().required(),
        membership_name : Joi.string().required(),
        mactive_date : Joi.string().required(),
        membership_duration: Joi.string().required(),
        expiry_date: Joi.string().required(),
        register_fees: Joi.number().required(),
        totalp: Joi.number().required(),
        dpayment: Joi.string().required(),
        ptype: Joi.string().required(),
        balance: Joi.string().required(),
        payment_time: Joi.string().required(),
        payment_type: Joi.string().required(),
        payment_money: Joi.string().required(),
        due_every: Joi.string().required(),
        due_every_month: Joi.string().required(),
        pay_inout: Joi.string().required(),
        pay_latter: Joi.string().required(),
        check_number: Joi.string().required(),
        card_number: Joi.string().required(),
        card_holder_name: Joi.string().required(),
        cvv_number: Joi.string().required(),
        card_expiry_date: Joi.string().required(),
        membership_status: Joi.string().required(),
        userId: Joi.string().required(),
        createdMonth: Joi.string().required(),
        createdYear: Joi.string().required()
    })

    // let addMemberSchema = Joi.object({
    //     studentType: Joi.string().required(),
    //     firstName: Joi.string().required(),
    //     lastName: Joi.string().required(),
    //     status: Joi.string().required(),
    //     days_expire: Joi.string().required(),
    //     dob:  Joi.string().required(),
    //     day_left: Joi.string().required(),
    //     age: Joi.string().required(),
    //     gender: Joi.string().required(),
    //     email: Joi.string().required(),
    //     primaryPhone:Joi.string().required(),
    //     secondaryNumber:Joi.string().required(),
    //     address: Joi.string().required(),
    //     country: Joi.string().required(),
    //     state: Joi.string().required(),
    //     zipPostalCode: Joi.string().required(),
    //     notes:Joi.string().required(),
    //     studentBeltSize: Joi.string().required(),
    //     program: Joi.string().required(),
    //     programColor:Joi.string().required() ,
    //     programID :Joi.string().required(),
    //     next_rank_id :Joi.string().required(),
    //     next_rank_name :Joi.string().required() ,
    //     next_rank_img :Joi.string().required(),
    //     current_rank_name :Joi.string().required(),
    //     current_rank_img :Joi.string().required(),
    //     current_rank_id :Joi.string().required(),
    //     current_stripe :Joi.string().required(),
    //     last_stripe_given_date :Joi.string().required(),
    //     category :Joi.string().required(),
    //     subcategory :Joi.string().required(),
    //     belt_rank_img :Joi.string().required(),
    //     belt_rank_name:Joi.string().required() ,
    //     location :Joi.string().required(),
    //     customId :Joi.string().required(),
    //     leadsTracking :Joi.string().required(),
    //     staff :Joi.string().required(),
    //     intrested :Joi.string().required(),
    //     school :Joi.string().required(),
    //     memberprofileImage :Joi.string().required(),
    //     rating :Joi.string().required(),
    //     attendence_color :Joi.string().required(),
    //     class_count :Joi.string().required(),
    //     attendence_status :Joi.string().required(),
    //     userId :Joi.string().required(),
    // })

    try {
        await buyMembershipSchema.validateAsync(req.body);
        if (req.body.ptype == 'cash' || req.body.ptype == 'check') {
            if (req.body.balance == 0) {
                status = { membership_status: 'Paid' }
                membershipDetails = _.extend(req.body, status)
            }
            else {
                status = { membership_status: 'Due' }
                membershipDetails = _.extend(req.body, status)
            }
            var membership = new buyMembership(membershipDetails);
            memberbuy = _.extend(membership, Id)
            memberbuy.save((err, data) => {
                if (err) {
                    res.send({ error: 'membership not buy' })
                    console.log(err)
                }
                else {
                    query = { '_id': studentId }
                    update = {
                        $set: { status: "active" },
                        $push: { membership_details: data._id }
                    }
                    addmemberModal.findOneAndUpdate(query, update, (err, stdData) => {
                        if (err) {
                            res.send({ error: 'membership id is not add in student' })
                        }
                        else {
                            buyMembership.findOneAndUpdate({ _id: data._id }, { $push: { studentInfo: stdData._id } })
                                .exec((err, result) => {
                                    if (err) {
                                        res.send({ error: 'student id is not add in buy membership' })
                                    }
                                    else {
                                        res.send({ msg: 'membership purchase successfully', data: result })
                                    }
                                })
                        }
    
                    })
                }
            })
        }
        else if (req.body.ptype == 'card') {
    
        }
    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }
    
}

exports.buyMembership = (req, res) => {
    var Id = { userId: req.params.userId }
    if (req.body.ptype == 'cash' || req.body.ptype == 'check') {

        if (req.body.balance == 0) {
            status = { membership_status: 'Paid' }
            membershipDetails = _.extend(req.body, status)
        }
        else {
            status = { membership_status: 'Due' }
            membershipDetails = _.extend(req.body, status)
        }
        var membership = new buyMembership(membershipDetails);
        memberbuy = _.extend(membership, Id)
        memberbuy.save((err, data) => {
            if (err) {
                res.send({ error: 'membership not buy' })
                console.log(err)
            }
            else {
                query = { 'firstName': req.body.student_name }
                update = {
                    $set: { status: "active" },
                    $push: { membership_details: data._id }
                }
                addmemberModal.findOneAndUpdate(query, update, (err, stdData) => {
                    if (err) {
                        res.send({ error: 'membership id is not add in student' })
                    }
                    else {
                        // res.send({msg:'membership purchase successfully'})
                        buyMembership.findOneAndUpdate({ _id: data._id }, { $push: { studentInfo: stdData._id } })
                            .exec((err, result) => {
                                if (err) {
                                    res.send({ error: 'student id is not add in buy membership' })
                                }
                                else {
                                    res.send({ msg: 'membership purchase successfully', data: result })
                                }
                            })
                    }

                })
            }
        })
    }
    else if (req.body.ptype == 'card') {

    }
}

exports.members_info = async (req, res) => {
    var studentId = req.params.studentId
    let studentInfo = await AddMember.findById(studentId)
    try {
        let {
            membership_details
        } = studentInfo;
        let membershipDa = await buyMembership.find({ _id: { $in: membership_details } });
        res.send({
            msg: "done",
            data: membershipDa
        })
    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }
}