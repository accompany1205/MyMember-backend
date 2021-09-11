const followUpNotes = require("../models/followup_notes");
const student = require("../models/addmember");
const user = require("../models/user");
const _ = require("lodash");
const memberModel = require("../models/addmember")

exports.createNote = async (req, res) => {
    let payload = req.body;
    let createNotePayload = payload;
    let filter = {
        "_id": req.params.studentId
    }
    let studentInfo = await student.findById(filter).exec();
    if (!studentInfo) {
        res.send({
            "msg": "Error while createign the note"
        })
    }
    createNotePayload.fistName = studentInfo.firstName;
    createNotePayload.lastName = studentInfo.lastName;

    let createdNote = await followUpNotes.create(createNotePayload);
    if (!createdNote) {
        res.send({
            "msg": "Error while createign the note"
        })
    }

    let updateNodeIdIntoStudent = await student.findByIdAndUpdate(req.params.studentId, {
        $push: {
            followup_notes: createdNote._id
        }
    },
        { new: true })
    if (!updateNodeIdIntoStudent) {
        res.send({
            "msg": "Error while createign the note"
        })
    }
    res.send({
        status: true,
        msg: "Followup note has been created for the student",
        data: updateNodeIdIntoStudent
    })
}

exports.removeNote = (req, res) => {
    var notesId = req.params.notesId
    birthdayNote.findByIdAndRemove({
        _id: notesId
    }, (err, removeNote) => {
        if (err) {
            res.send({
                error: 'notes is not delete'
            })
        } else {
            console.log(removeNote)
            student.update({
                "birthday_notes": removeNote._id
            }, {
                $pull: {
                    "birthday_notes": removeNote._id
                }
            })
                .exec((err, noteUpdateStd) => {
                    console.log(noteUpdateStd)
                    if (err) {
                        res.send({
                            error: 'notes is not remove in student'
                        });
                    } else {
                        user.update({
                            "birthday_note_history": removeNote._id
                        }, {
                            $pull: {
                                "birthday_note_history": removeNote._id
                            }
                        })
                            .exec((err, noteUpdateUser) => {
                                if (err) {
                                    res.send({
                                        error: 'notes is not remove in school'
                                    })
                                } else {
                                    res.send({
                                        msg: 'notes is remove successfully'
                                    })
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
    birthdayNote.findByIdAndUpdate(notesid, req.body).exec((err, updateNote) => {
        if (err) {
            res.send({
                error: 'birthday notes is not update'
            })
        } else {
            res.send({
                msg: 'birthday notes update successfully'
            })
        }
    })
}