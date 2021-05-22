const renewalnote = require("../models/renewal_note");
const student = require("../models/addmember");
const user = require("../models/user");
const _ = require("lodash");
const service = require('../email_sms')

function TimeZone(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const date_time =str.split(',')
    console.log(date_time)
    const date = date_time[0]
    const time = date_time[1]
    return { Date:date,Time:time}
}

exports.create =(req,res)=>{
student.findById(req.params.studentId).exec((err,studetData)=>{
        if(err){
            res.send({error:'student data not found'})
        }
        else{
            if(req.body.Type == 'manual email' || req.body.Type == 'manual text'){
            var obj ={
                firstName:studetData.firstName,
                lastName:studetData.lastName,
                userId:req.params.userId
            }
            var date_time = TimeZone()
            var renewal = new renewalnote(req.body);
            renewal.date = date_time.Date
            renewal.time = date_time.Time
            renewObj = _.extend(renewal,obj) 

            renewObj.save((err,note)=>{
                if(err){
                    res.send({error:'renewal notes is not create'})
                    console.log(err)
                }
                else{
                    student.findByIdAndUpdate(req.params.studentId,{$push: { renewals_notes: note._id }})
                    .exec((err,renewalStd)=>{
                        if(err){
                            res.send({error:'renewal notes is not add in student'})
                        }
                        else{
                            // res.send(note)
                            user.findByIdAndUpdate(req.params.userId,{$push: { renewal_history: note._id }})
                            .exec((err,renewalUser)=>{
                                if(err){
                                    res.send({error:'renewal notes is not add in school'})
                                }
                                else{
                                    res.send(note)
                                }
                            })
                        }
                    })
                }
            })

        }

        else if(req.body.Type == 'system email'){
            var toEmail = studetData.email
            var emailText = req.body.notes
            service.sendEmail(emailText,toEmail).then((respEmail)=>{
               var obj ={
                    firstName:studetData.firstName,
                    lastName:studetData.lastName,
                    userId:req.params.userId
                }
            var date_time = TimeZone()
            var renewal = new renewalnote(req.body);
            renewal.date = date_time.Date
            renewal.time = date_time.Time
            renewObj = _.extend(renewal,obj) 

            renewObj.save((err,note)=>{
                if(err){
                    res.send({error:'renewal notes is not create'})
                    console.log(err)
                }
                else{
                    student.findByIdAndUpdate(req.params.studentId,{$push: { renewals_notes: note._id }})
                    .exec((err,renewalStd)=>{
                        if(err){
                            res.send({error:'renewal notes is not add in student'})
                        }
                        else{
                            // res.send(note)
                            user.findByIdAndUpdate(req.params.userId,{$push: { renewal_history: note._id }})
                            .exec((err,renewalUser)=>{
                                if(err){
                                    res.send({error:'renewal notes is not add in school'})
                                }
                                else{
                                    res.send(note)
                                }
                            })
                        }
                    })
                }
            })
        }).catch((err)=>{
            console.log(err)
            res.send({error:'email not sent to student'})
        })
        }

        else if(req.body.Type == 'system text'){
            var toNumber = studetData.primaryPhone
            var emailText = req.body.notes
            service.sendEmail(emailText,toNumber).then((respText)=>{
               var obj ={
                    firstName:studetData.firstName,
                    lastName:studetData.lastName,
                    userId:req.params.userId
                }
            var date_time = TimeZone()
            var renewal = new renewalnote(req.body);
            renewal.date = date_time.Date
            renewal.time = date_time.Time
            renewObj = _.extend(renewal,obj) 

            renewObj.save((err,note)=>{
                if(err){
                    res.send({error:'renewal notes is not create'})
                    console.log(err)
                }
                else{
                    student.findByIdAndUpdate(req.params.studentId,{$push: { renewals_notes: note._id }})
                    .exec((err,renewalStd)=>{
                        if(err){
                            res.send({error:'renewal notes is not add in student'})
                        }
                        else{
                            // res.send(note)
                            user.findByIdAndUpdate(req.params.userId,{$push: { renewal_history: note._id }})
                            .exec((err,renewalUser)=>{
                                if(err){
                                    res.send({error:'renewal notes is not add in school'})
                                }
                                else{
                                    res.send(note)
                                }
                            })
                        }
                    })
                }
            })
        }).catch((err)=>{
            console.log(err)
            res.send({error:'text sms not sent to student'})
        })
      }
    }
    })
}

exports.remove =(req,res)=>{
    var notesId = req.params.notesId
    renewalnote.findByIdAndRemove({_id:notesId},(err,removeNote)=>{
        if(err){
            res.send({error:'notes is not delete'})
        }
        else{
            console.log(removeNote)
            student.update({"renewals_notes":removeNote._id},{$pull:{"renewals_notes":removeNote._id}})
            .exec((err,noteUpdateStd)=>{
                console.log(noteUpdateStd)
                if(err){
                    res.send({error:'notes is not remove in student'});
                }
                else{
                    user.update({"renewal_history":removeNote._id},{$pull:{"renewal_history":removeNote._id}})
                    .exec((err,noteUpdateUser)=>{
                        if(err){
                            res.send({error:'notes is not remove in school'})
                        }
                        else{
                            res.send({msg:'notes is remove successfully'})
                        }
                    })
                }
            })
        }
    })
}

exports.updateNote = (req,res)=>{
    var notesid = req.params.notesId
    console.log(req.body)
    renewalnote.findByIdAndUpdate(notesid,req.body).exec((err,updateNote)=>{
        if(err){
            res.send({error:'miss you call notes is not update'})
        }
        else{
            res.send({msg:'miss you call notes update successfully'})
        }
    })
}
    
exports.expireStd = async(req,res)=>{
    try{
    var dataExpire = await student.find({status:"expired"},{firstName:1,lastName:1,age:1,memberprofileImage:1,last_contact_renewal:1})
    res.send(dataExpire)
    }catch(e){
        res.send({error:'expire student data not fount'})
        console.log(e)
    }
}

exports.expire_thirty_std = async(req,res)=>{
    try{
        var dataExpire = await student.find({days_expire:"30"},{firstName:1,lastName:1,age:1,memberprofileImage:1,last_contact_renewal:1})
        res.send(dataExpire)
        }catch(e){
            res.send({error:'expire student data not fount'})
            console.log(e)
        }
}

exports.expire_sixty_std = async(req,res)=>{
    try{
        var dataExpire = await student.find({days_expire:"60"},{firstName:1,lastName:1,age:1,memberprofileImage:1,last_contact_renewal:1})
        res.send(dataExpire)
        }catch(e){
            res.send({error:'expire student data not fount'})
            console.log(e)
        }
}
