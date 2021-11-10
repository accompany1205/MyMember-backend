const user = require('../models/user')
const emailNurturing = require("../models/email_nurturing")
const emailSent = require('../models/emailSentSave')
const sgMail = require('sendgrid-v3-node');
const  Member = require('../models/addmember') 
const AuthKey = require('../models/email_key')

function TimeZone(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const date_time =str.split(',')
    const date = date_time[0]
    const time = date_time[1]
    return { Date:date,Time:time}
}

exports.userEmailList = (req,res)=>{
    user.findOne({_id:req.params.userId})
    .select('bussinessEmail')
    .exec((err,userEmail)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send(userEmail)
        }
    })
}

exports.category_list =(req,res)=>{
    emailNurturing.find({userId:req.params.userId})
    .populate('folder')
    .exec((err,categoryList)=>{
        if(err){
            res.send({error:'compose category is not found'})
        }
        else{
            res.send(categoryList)
        }
    })
}

exports.addcategory = (req,res)=>{
    var cat ={
        categoryName: req.body.categoryName,
        userId: req.params.userId
    }
    var category = new emailNurturing(cat);
    category.save((err,data)=>{
        if(err){
            res.send({error:'category is not add'})
        }
        else{
            res.send({msg:'category is add successfully',category:data})
        }
    })
}

exports.updateCategory =(req,res)=>{
    emailNurturing.findByIdAndUpdate(req.params.categoryId,req.body)
    .exec((err,updateCat)=>{
        if(err){
            res.send({error:'category is not update'})
        }
        else{
            res.send({msg:"category is update successfully"})
        }
    })
}



exports.removeCategory =(req,res)=>{
    emailNurturing.findByIdAndRemove(req.params.categoryId)
    .exec((err,delData)=>{
        if(err){
            res.send({error:'category is not delete'})
        }
        else{
            res.send({msg:'category is remove successfully'})
        }
    })
}

exports.tempList = (req,res)=>{
    Member.find({$and:[{userId:req.params.userId},{status:'Active'}]})
    .select("firstName")
    .select("lastName")
    .select("primaryPhone")
    .select("email")
    .select("status")
    .exec((err,tempList)=>{
        if(err){
            res.send(err)
        }
        res.send(tempList)
    })
}

exports.sendEmail = (req,res)=>{
    const emailData = {
            sendgrid_key: process.env.Email_Key,
            to: req.body.to,
            from_email: req.body.from,
            from_name: 'noreply@gmail.com',
        };
        
        emailData.subject = req.body.subject;
        emailData.content = req.body.template;
    
        sgMail.send_via_sendgrid(emailData).then(resp=>{
           var DT = TimeZone() 
           var emailDetail =  new emailSent(req.body)
           emailDetail.sent_date = DT.Date
           emailDetail.sent_time = DT.Time
           emailDetail.save((err,emailSave)=>{
               if(err){
                   res.send({error:'email details is not save'})
               }
               else{
                   emailSent.findByIdAndUpdate(emailSave._id,{userId:req.params.userId,email_type:'sent',category:'compose'})
                   .exec((err,emailUpdate)=>{
                       if(err){
                           res.send({error:'user id is not update in sent email'})
                       }
                       else{
                            res.send(emailUpdate)
                       }
                   })
               }
           })
        }).catch(err=>{
            res.send({error:'email not send',error:err})
        })

}