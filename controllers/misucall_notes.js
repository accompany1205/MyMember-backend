const misucallNote = require("../models/misucall_notes")
const student = require("../models/addmember");
const user = require("../models/user");
const attendence = require("../models/attendence");
const memberShip = require('../models/membership')
const missYouCallNotes = require('../models/misucall_notes')
const _ = require("lodash");
const getNumberOfDays = require('../Services/dayDifference');
const misucall_notes = require("../models/misucall_notes");


exports.seven_to_forteen = async (req, res) => {
    try {
        const membership_details = await memberShip.find({ userId: req.params.userId }, { expiry_date: 1, mactive_date: 1, membership_name: 1 })
        const missYouCall_notes = await missYouCallNotes.find({ userId: req.params.userId })

        await student.aggregate([
            {
                $project: {
                    'firstName': 1,
                    'lastName': 1,
                    'memberprofileImage': 1,
                    'last_contact_missCall': 1,
                    'rating': 1,
                }
            },
            {
                $lookup: {
                    from: "attendences",
                    localField: '_id',
                    foreignField: "studentId",
                    as: "data"
                }
            }
        ]
        )
            .then(async (result) => {
                const newArr = []
                const current_Date = new Date()
                newObj = new Object()
                await result.forEach(i => {
                    a = i.data
                    if (a.length >= 1) {
                        last_Date = (new Date(a[a.length - 1].date))

                        dayDifference = getNumberOfDays(last_Date, current_Date)
                        if (dayDifference >= 7 && dayDifference <= 14) {
                            newObj = {
                                _id: i._id,
                                firstName: i.firstName,
                                lastName: i.lastName,
                                memberprofileImage: i.memberprofileImage,
                                rating: i.rating,
                                last_contact_missCall: i.last_contact_missCall,
                                missYouCall_notes: missYouCall_notes,
                                membership_details: membership_details,
                                last_Class_Attended_date: last_Date,
                                date: a[a.length - 1].date,
                                dayDifference: getNumberOfDays(last_Date, current_Date)
                            }
                            newArr.push(newObj)
                        }
                    }
                })
                res.status(200).send(newArr)

            }).catch((err) => {
                res.status(404).send({ message: err.message })
            })
    }

    catch (Er) {
        console.log(Er)
    }

}

exports.fifteen_to_thirty = async (req, res) => {
    try {
        const membership_details = await memberShip.find({ userId: req.params.userId }, { expiry_date: 1, mactive_date: 1, membership_name: 1 })
        const missYouCall_notes = await missYouCallNotes.find({ userId: req.params.userId })

        await student.aggregate([
            {
                $project: {
                    'firstName': 1,
                    'lastName': 1,
                    'memberprofileImage': 1,
                    'last_contact_missCall': 1,
                    'rating': 1,
                }
            },
            {
                $lookup: {
                    from: "attendences",
                    localField: '_id',
                    foreignField: "studentId",
                    as: "data"
                }
            }
        ]
        )
            .then(async (result) => {
                const newArr = []
                const current_Date = new Date()
                newObj = new Object()
                await result.forEach(i => {
                    a = i.data
                    if (a.length >= 1) {
                        last_Date = (new Date(a[a.length - 1].date))
                        dayDifference = getNumberOfDays(last_Date, current_Date)
                        if (dayDifference > 14 && dayDifference <= 30) {
                            newObj = {
                                _id: i._id,
                                firstName: i.firstName,
                                lastName: i.lastName,
                                memberprofileImage: i.memberprofileImage,
                                rating: i.rating,
                                last_contact_missCall: i.last_contact_missCall,
                                missYouCall_notes: missYouCall_notes,
                                membership_details: membership_details,
                                last_Class_Attended_date: last_Date,
                                dayDifference: getNumberOfDays(last_Date, current_Date)
                            }
                            newArr.push(newObj)
                        }
                    }
                })
                res.status(200).send(newArr)

            }).catch((err) => {
                res.status(404).send({ message: err.message })
            })
    }

    catch (Er) {
        console.log(Er)
    }
}



exports.moreThirty = async (req, res) => {
    try {
        const membership_details = await memberShip.find({}, { expiry_date: 1, mactive_date: 1, membership_name: 1 })
        const missYouCall_notes = await missYouCallNotes.find({})
        await student.aggregate([
            {
                $project: {
                    'firstName': 1,
                    'lastName': 1,
                    'memberprofileImage': 1,
                    'last_contact_missCall': 1,
                    'rating': 1,
                }
            },
            {
                $lookup: {
                    from: "attendences",
                    localField: '_id',
                    foreignField: "studentId",
                    as: "data"
                }
            }
        ]
        )
            .then(async (result) => {
                const newArr = []
                const current_Date = new Date()
                newObj = new Object()
                await result.forEach(i => {
                    a = i.data
                    if (a.length >= 1) {
                        last_Date = (new Date(a[a.length - 1].date))
                        dayDifference = getNumberOfDays(last_Date, current_Date)
                        if (dayDifference > 30) {
                            newObj = {
                                _id: i._id,
                                firstName: i.firstName,
                                lastName: i.lastName,
                                memberprofileImage: i.memberprofileImage,
                                rating: i.rating,
                                last_contact_missCall: i.last_contact_missCall,
                                missYouCall_notes: missYouCall_notes,
                                membership_details: membership_details,
                                last_Class_Attended_date: last_Date,
                                dayDifference: getNumberOfDays(last_Date, current_Date)
                            }
                            newArr.push(newObj)
                        }
                    }
                })
                res.status(200).send(newArr)

            }).catch((err) => {
                res.status(404).send({ message: err.message })
            })
    }
    catch (Er) {
        console.log(Er)
    }
}

exports.listApp_and_callHistory = (req, res) => {
    console.log(req.params.userId)
    user.find({ _id: req.params.userId }, { upsert: true })
        .populate('missYouCall_note_history')
        .populate('missYouCall_appoinment_history')
        .exec((err, data) => {
            if (err) {
                res.send(err)
            }
            else {
                res.send(data)
            }
        })
}

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
            var misucall = new misucallNote(req.body);
            misucallObj = _.extend(misucall, obj)

            misucallObj.save((err, note) => {
                console.log(note)
                if (err) {
                    res.send({ error: 'miss u call notes is not create' })
                    console.log(err)
                }
                else {
                    update = {
                        $push: { missYouCall_notes: note._id },
                        $set: { last_contact_missCall: new Date() }
                    },
                        student.findByIdAndUpdate(req.params.studentId, update)
                            .exec((err, missuCallStd) => {
                                if (err) {
                                    res.send({ error: 'miss u call notes is not add in student' })
                                }
                                else {
                                    // res.send(note)
                                    user.findByIdAndUpdate(req.params.userId, { $push: { missYouCall_note_history: note._id } })
                                        .exec((err, missuCallUser) => {
                                            if (err) {
                                                res.send({ error: 'miss u call notes is not add in school' })
                                            }
                                            else {
                                                res.send({ msg: 'miss u call note create successfuly', note: note })
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
    misucallNote.findByIdAndRemove({ _id: notesId }, (err, removeNote) => {
        if (err) {
            res.send({ error: 'notes is not delete' })
        }
        else {
            console.log(removeNote)
            student.update({ "missYouCall_notes": removeNote._id }, { $pull: { "missYouCall_notes": removeNote._id } })
                .exec((err, noteUpdateStd) => {
                    console.log(noteUpdateStd)
                    if (err) {
                        res.send({ error: 'notes is not remove in student' });
                    }
                    else {
                        user.update({ "missYouCall_note_history": removeNote._id }, { $pull: { "missYouCall_note_history": removeNote._id } })
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
    console.log(req.body)
    misucallNote.findByIdAndUpdate(notesid, req.body).exec((err, updateNote) => {
        if (err) {
            res.send({ error: 'miss you call notes is not update' })
        }
        else {
            res.send({ msg: 'miss you call notes update successfully' })
        }
    })
}