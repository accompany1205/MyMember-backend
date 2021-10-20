const renewalnote = require("../models/renewal_note");
const student = require("../models/addmember");
const user = require("../models/user");
const _ = require("lodash");

exports.create =(req,res)=>{
student.findById(req.params.studentId).exec((err,studetData)=>{
        if(err){
            res.send({error:'student data not found'})
        }
        else{
            var obj ={
                firstName:studetData.firstName,
                lastName:studetData.lastName,
                userId:req.params.userId
            }

            var renewal = new renewalnote(req.body);
            renewObj = _.extend(renewal,obj) 

            renewObj.save((err,note)=>{
                if(err){
                    res.send({error:'renewal notes is not create'})
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
    })
}

exports.remove =(req,res)=>{
    var notesId = req.params.notesId
    renewalnote.findByIdAndRemove({_id:notesId},(err,removeNote)=>{
        if(err){
            res.send({error:'notes is not delete'})
        }
        else{
            student.update({"renewals_notes":removeNote._id},{$pull:{"renewals_notes":removeNote._id}})
            .exec((err,noteUpdateStd)=>{
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
    }
}

exports.expire_thirty_std = async(req,res)=>{
    try{
        var dataExpire = await student.find({days_expire:"30"},{firstName:1,lastName:1,age:1,memberprofileImage:1,last_contact_renewal:1})
        res.send(dataExpire)
        }catch(e){
            res.send({error:'expire student data not fount'})
            
        }
}

exports.expire_sixty_std = async(req,res)=>{
    try{
        var dataExpire = await student.find({days_expire:"60"},{firstName:1,lastName:1,age:1,memberprofileImage:1,last_contact_renewal:1})
        res.send(dataExpire)
        }catch(e){
            res.send({error:'expire student data not fount'})
            
        }
}
