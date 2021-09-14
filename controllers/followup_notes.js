const followUpNotes = require("../models/followup_notes");
const student = require("../models/addmember");
const user = require("../models/user");
const _ = require("lodash");
const memberModel = require("../models/addmember")

exports.createNote = async (req, res) => {
    let memberId = req.params.memberId;
    console.log("This is the member.... ", memberId)
    if (!memberId) {
        res.send({
            status: true,
            "msg": "Member Id not found in the params!!"
        })
    }
    let payload = req.body;
    let createNotePayload = payload;
    let filter = {
        "_id": memberId
    }
    let studentInfo = await student.findById(filter).exec();
    if (!studentInfo) {
        res.send({
            status: true,
            "msg": "Data not exists into the collection!!"
        })
    }
    createNotePayload.firstName = studentInfo.firstName;
    createNotePayload.lastName = studentInfo.lastName;
    createNotePayload.userId = studentInfo.userId,
        createNotePayload.memberId = studentInfo._id

    let createdNote = await followUpNotes.create(createNotePayload);
    if (!createdNote) {
        res.send({
            status: false,
            "msg": "Error while createign the note"
        })
    }

    let updateNoteIdIntoStudent = await student.findByIdAndUpdate(memberId, {
        $push: {
            followup_notes: createdNote._id
        }
    }, {
        new: true
    })
    if (!updateNoteIdIntoStudent) {
        res.send({
            status: false,
            "msg": "Error while updating into member"
        })
    }
    res.send({
        status: true,
        msg: "Followup note has been created for the student",
        data: createdNote
    })
}

exports.getNotesByUserId = async (req, res) => {
    var userId = req.params.userId;    
    if (!userId) {
        res.send({
            status: true,
            msg: "Member Id not found in the params!!"
        })
    }
    let filter = {
        "userId":userId
    }
    let notes = await followUpNotes.find(filter);
    if(!notes){
        res.send({
            status: true,
            msg: "Data not exists for this query!!"
        })
    }
    res.send({
        status: true,
        msg: "Please find the notes with userId",
        data : notes
    })

}

exports.getNotesByMemberId = async (req, res) => {
    var memberId = req.params.memberId;    
    if (!memberId) {
        res.send({
            status: true,
            msg: "Member Id not found in the params!!"
        })
    }
    let filter = {
        "memberId":memberId
    }
    let notes = await followUpNotes.find(filter);
    if(!notes){
        res.send({
            status: true,
            msg: "Data not exists for this query!!"
        })
    }
    res.send({
        status: true,
        msg: "Please find the notes with userId",
        data : notes
    })

}

exports.getNotesByNoteType = async (req, res) => {
    var memberId = req.params.memberId;    
    if (!memberId) {
        res.send({
            status: true,
            msg: "Member Id not found in the params!!"
        })
    }
    let filter = {
        "memberId":memberId
    }
    let notes = await followUpNotes.find(filter);
    if(!notes){
        res.send({
            status: true,
            msg: "Data not exists for this query!!"
        })
    }
    res.send({
        status: true,
        msg: "Please find the notes with userId",
        data : notes
    })

}


exports.updateNote = async (req, res) => {
    let noteId = req.params.noteId;    
    let {body:payload} = req;
    if(!payload){
        res.json({
            status: false,
            msg:"Please check your input details!!"
        })
    }
    if (!noteId) {
        res.send({
            status: true,
            msg: "Note id not found in the params!!"
        })
    }
    let updatedNote = await followUpNotes.findByIdAndUpdate(noteId,payload,{new:true});
    if(!updatedNote){
        res.send({
            status: true,
            msg: "Data not exists for this query!!"
        })
    }
    res.send({
        status: true,
        msg: "The note has been updated!!",
        data : updatedNote
    })

}

exports.removeNote = async(req,res)=>{
    let noteId = req.params.noteId;    
    if (!noteId) {
        res.send({
            status: true,
            msg: "Note id not found in the params!!"
        })
    }
    let deletedNote = await followUpNotes.findByIdAndDelete(noteId);
    if(!deletedNote){
        res.send({
            status: true,
            msg: "Data not exists for this query!!"
        })
    }
    res.send({
        status: true,
        msg: "The note has been removed!!",
        data : {}
    })
}