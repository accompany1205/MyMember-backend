const template = require("../models/emailSentSave")
const nurturing_folder = require("../models/email_nurturing_folder")
const key = require("../models/email_key")

exports.list_template = (req,res)=>{
    nurturing_folder.findById(req.params.folderId)
    .populate('template')
    .exec((err,template_data)=>{
        if(err){
            res.send({error:'nurturing template list not found'})
            console.log(err)
        }
        else{
            res.send(template_data)
        }
    })
}

exports.add_template = (req,res)=>{
    // var schedule = req.body.schedule
    key.find({userId:req.params.userId})
    .exec((err,Key)=>{
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
                category:'nurturing',
                email_status:true,
                email_auth_key:Key.auth_key,
                userId:req.params.userId,
                folderId:req.params.folderId,
                createdBy:'admin'
            }
                var emailDetail =  new template(obj)
                console.log(emailDetail)
                emailDetail.save((err,emailSave)=>{
         
         if(err){
              res.send(err)
              console.log(err)
          }
          else{
            nurturing_folder.findByIdAndUpdate(req.params.folderId,{$push:{template:emailSave._id}})
            .exec((err,template)=>{
                if(err){
                    res.send({error:'nurturing template details is not add in folder'})
                }
                else{
                    res.send({msg:'nurturing template details is add in folder',result:emailSave})
                }
            })
          }
      })
    }
 })
    
}

exports.remove_template =(req,res)=>{
    template.findByIdAndRemove(req.params.templateId,(err,removeTemplate)=>{
        if(err){
            res.send({error:'nurturing template is not remove'})
        }
        else{
            console.log(removeTemplate)
            nurturing_folder.update({"template":removeTemplate._id},{$pull:{"template":removeTemplate._id}},
            function(err,temp){
                if(err){
                    res.send({error:'nurturing template details is not remove in folder'})
                }
                else{
                    res.send({msg:'nurturing template is remove successfully'})
                }
            })
        }
    })
}

exports.update_template =(req,res)=>{
    template.update({_id:req.params.templateId},req.body,(err,updateTemp)=>{
        if(err){
            res.send({error:'template is not update'})
        }
        else{
            res.send(updateTemp)
        }
    }) 
}

exports.status_update_template =(req,res)=>{
    if(req.body.status == 'false'){
        template.find({$and:[{userId:req.params.userId},{folderId:req.params.folderId}]})
        .exec((err,TempData)=>{
            if(err){
                res.send(err)
            }
            else{
                console.log(TempData)
                async.eachSeries(TempData,(obj,done)=>{
                    template.findByIdAndUpdate(obj._id,{$set:{email_status:false}},done)
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
        template.find({$and:[{userId:req.params.userId},{folderId:req.params.folderId}]})
       .exec((err,TempData)=>{
            if(err){
                res.send(err)
            }
            else{
                console.log(TempData)
                async.eachSeries(TempData,(obj,done)=>{
                    template.findByIdAndUpdate(obj._id,{$set:{email_status:true}},done)
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