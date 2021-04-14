const all_temp = require("../models/emailSentSave");
const compose_folder = require("../models/email_compose_folder")
const authKey = require("../models/email_key")
const async = require('async')

exports.status_update_template = (req,res)=>{
    if(req.body.status == 'false'){
        all_temp.find({$and:[{userId:req.params.userId},{folderId:req.params.folderId}]})
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
        all_temp.find({$and:[{userId:req.params.userId},{folderId:req.params.folderId}]})
       .exec((err,TempData)=>{
            if(err){
                res.send(err)
            }
            else{
                console.log(TempData)
                async.eachSeries(TempData,(obj,done)=>{
                    all_temp.findByIdAndUpdate(obj._id,{$set:{email_status:true}},done)
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

exports.all_email_list = async(req,res)=>{
    all_temp.find({userId:req.params.userId})
    .exec((err,allTemp)=>{
        if(err){
            res.send({error:'template list not found'})
        }
        else{
            res.send(allTemp)
        }
    })
}

exports.list_template = (req,res)=>{
    console.log(req.params.folderId)
    compose_folder.findById(req.params.folderId)
    .populate('template')
    .exec((err,template_data)=>{
        if(err){
            res.send(err)
            console.log(err)
        }
        else{
            res.send(template_data)
        }
    })
}

exports.add_template = (req,res)=>{
    // var schedule = req.body.schedule
    //    authKey.findOne({userId:req.params.userId})      
    //     .exec((err,key)=>{
    //         if(err){
    //             res.send({Error:'email auth key is not find so schedule is not create',error:err})
    //         }
    //         else{
    //             console.log(key)
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
                    category:'compose',
                    userId:req.params.userId,
                    folderId:req.params.folderId
                }
          var emailDetail =  new all_temp(obj)
          emailDetail.save((err,emailSave)=>{
              if(err){
                  res.send({Error:'email details is not save',error:err})
                  console.log(err)
              }
              else{
                compose_folder.findByIdAndUpdate(req.params.folderId,{$push:{template:emailSave._id}})
                .exec((err,template)=>{
                    if(err){
                        res.send({error:'compose template details is not add in folder'})
                    }
                    else{
                        res.send({msg:'compose template details is add in folder',result:emailSave})
                    }
                 })
              }
          })
    //    }
    // })
}
exports.update_template =(req,res)=>{
    all_temp.updateOne({_id:req.params.templateId},req.body,(err,updateTemp)=>{
        if(err){
            res.send({code:400,msg:'template is not update'})
        }
        else{
            res.send({code:200,msg:'template update success',result:updateTemp})
        }
    }) 
}

exports.remove_template =(req,res)=>{
    all_temp.findByIdAndRemove(req.params.templateId,(err,removeTemplate)=>{
        if(err){
            res.send({error:'compose template is not remove'})
        }
        else{
            console.log(removeTemplate)
            compose_folder.update({"template":removeTemplate._id},{$pull:{"template":removeTemplate._id}},
            function(err,temp){
                if(err){
                    res.send({error:'compose template details is not remove in folder'})
                }
                else{
                    res.send({msg:'compose template is remove successfully'})
                }
            })
        }
    })
}