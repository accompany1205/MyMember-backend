const All_Temp = require("../models/emailSentSave")
const library_folder = require("../models/email_library_folder")
const auth_Key = require("../models/email_key")
const async = require('async')

exports.list_template = (req,res)=>{
    library_folder.findById(req.params.folderId)
    .populate('template')
    .exec((err,template_data)=>{
        if(err){
            res.send({error:'library template list not found'})
            console.log(err)
        }
        else{
            res.send(template_data)
        }
    })
}

exports.add_template = (req,res)=>{
    // var schedule = req.body.schedule
    auth_Key.find({userId:req.params.userId})
    .exec((err,keyData)=>{
        if(err){
            res.send({Error:'email auth key is not find so schedule is not create',error:err})
        }
       else{
        var obj ={
            to: req.body.to,
            from: req.body.from,
            title:req.body.title,
            subject:req.body.subject, 
            template:req.body.template,
            sent_date: req.body.sent_date,
            sent_time: req.body.sent_time,
            repeat_mail: req.body.repeat_mail,
            follow_up: req.body.follow_up,
            email_type:'schedule',
            email_status:true,
            category:'library',
            email_auth_key:keyData.auth_key,
            userId:req.params.userId,
            folderId:req.params.folderId
        }
  var emailDetail =  new All_Temp(obj)
  emailDetail.save((err,emailSave)=>{
      if(err){
        res.send(err)
        console.log(err)
      }
      else{
        library_folder.findByIdAndUpdate(req.params.folderId,{$push:{template:emailSave._id}})
        .exec((err,template)=>{
            if(err){
                res.send({error:'library template details is not add in folder'})
            }
            else{
                res.send({msg:'library template details is add in folder',result:emailSave})
              }
            })
          }
       })
     } 
  })
}

exports.update_template =(req,res)=>{
    All_Temp.update({_id:req.params.templateId},req.body)
    .exec((err,updateTemp)=>{
        if(err){
            res.send({error:'template is not update'})
        }
        else{
            res.send(updateTemp)
        }
    })  
}

exports.status_update_template = (req,res)=>{
    if(req.body.status == 'false'){
        All_Temp.find({$and:[{userId:req.params.userId},{folderId:req.params.folderId}]})
        .exec((err,TempData)=>{
            if(err){
                res.send(err)
            }
            else{
                console.log(TempData)
                async.eachSeries(TempData,(obj,done)=>{
                    All_Temp.findByIdAndUpdate(obj._id,{$set:{email_status:false}},done)
                    },function Done(err,List){
                      if(err){
                        res.send(err)
                      }
                      else{
                        res.send({msg:'this folder all template is deactivate'})
                      }
                 })  
            }
        })
    }
    else if(req.body.status == 'true'){
        
        All_Temp.find({$and:[{userId:req.params.userId},{folderId:req.params.folderId}]})
       .exec((err,TempData)=>{
            if(err){
                res.send(err)
            }
            else{
                console.log(TempData)
                async.eachSeries(TempData,(obj,done)=>{
                    All_Temp.findByIdAndUpdate(obj._id,{$set:{email_status:true}},done)
                    },function Done(err,List){
                      if(err){
                        res.send(err)
                      }
                      else{
                        res.send({msg:'this folder all template is activate'})
                      }
                 })  
            }
        })
    }
}

exports.remove_template =(req,res)=>{
    All_Temp.findByIdAndRemove(req.params.templateId,(err,removeTemplate)=>{
        if(err){
            res.send({Error:'library template is not remove',error:err})
        }
        else{
            console.log(removeTemplate)
            library_folder.update({"template":removeTemplate._id},{$pull:{"template":removeTemplate._id}},
            function(err,temp){
                if(err){
                    res.send({error:'library template details is not remove in folder'})
                }
                else{
                    res.send({msg:'library template is remove successfully'})
                }
            })
        }
    })
}