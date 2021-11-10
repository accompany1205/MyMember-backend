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

exports.expireStd = async (req, res) => {
    try {
        let userId = req.params.userId;
        let allMembers = await student.find({ userId: userId, membership_details: { $exists: true, $not: { $size: 0 } } },
            { firstName: 1, lastName: 1, age: 1, memberprofileImage: 1, last_contact_renewal: 1 })
            .populate({
                path: 'membership_details',
                match: { membership_status: "Active" },
                select: 'membership_name membership_status expiry_date'
            })

        res.send(allMembers)
    } catch (e) {
        res.send({ error: 'expire student data not found' })
    }
}

exports.expire_thirty_std = async (req, res) => {
    try {
        let userId = req.params.userId;
        await student.find({
            userId: userId, membership_details: { $exists: true, $not: { $size: 0 }, $ne: [] }
        }, { firstName: 1, lastName: 1, age: 1, memberprofileImage: 1, last_contact_renewal: 1 })
            .populate({
                path: 'membership_details',
                select: 'membership_name membership_status expiry_date'
            })
            .exec((er, data) => {
                if (er) {
                    res.send(er);
                }
                x = []
                data.forEach((element, j) => {
                    (element.membership_details).forEach((e, i) => {
                        if (30 > dayRemaining(e.expiry_date)) {
                            e.daysLeft = dayRemaining(e.expiry_date)
                            if(!x.includes(element)){
                                x.push(element)
                    
                            }
                    

                        } else {
                            element.membership_details.pop(i)
                        }
                    })
      

                });
                res.send({ data: x, success: true })

            })

    } catch (e) {
        res.send({ error: 'expire student data not fount', a: e })

    }
}

exports.expire_sixty_std = async (req, res) => {
    try {
        let userId = req.params.userId;
        await student.find({
            userId: userId, membership_details: { $exists: true, $not: { $size: 0 }, $ne: [] }
        }, { firstName: 1, lastName: 1, age: 1, memberprofileImage: 1, last_contact_renewal: 1 })
            .populate({
                path: 'membership_details',
                select: 'membership_name membership_status expiry_date'
            })
            .exec((er, data) => {
                if (er) {
                    res.send(er);
                }
                x = []
                data.forEach((element, j) => {
                    (element.membership_details).forEach((e, i) => {
                        if (60 > dayRemaining(e.expiry_date)) {
                            e.daysLeft = dayRemaining(e.expiry_date)
                            if(!x.includes(element)){
                                x.push(element)
                    
                            }
                            

                        } else {
                            element.membership_details.pop(i)
                        }
                    })
                });
                res.send({ data: x, success: true })

            })

    } catch (e) {
        res.send({ error: 'expire student data not fount' })

    }
}
