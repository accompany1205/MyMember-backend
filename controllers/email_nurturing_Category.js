const emailNurturing = require("../models/email_nurturing_Category")
const emailSent = require('../models/emailSentSave')
const sgMail = require('sendgrid-v3-node');
const  Member = require('../models/addmember') 
const user = require('../models/user')
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

exports.sendEmail =  (req,res)=>{
    if (!req.body.subject || !req.body.template || !req.body.to) {
        res.send({ error: "invalid input", success: false })
    } else{
        let attachment = req.files;
        const attachments = attachment.map((file) => {
            let content = Buffer.from(file.buffer).toString("base64")
            return {
                content: content,
                filename: file.originalname,
                type: `application/${file.mimetype.split("/")[1]}`,
                disposition: "attachment"
            }
        });
    const emailData = {
            sendgrid_key: process.env.SENDGRID_API_KEY,
            to: req.body.to,
            from_email:process.env.from_email,
            //from_name: 'noreply@gmail.com',
            subject: req.body.subject,
            content: req.body.template,
            attachments: attachments
        };
  
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

}}