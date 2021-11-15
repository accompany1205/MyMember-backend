const emailSystem = require("../../models/email_system_Category")
const user = require('../../models/user')
const emailSent = require('../../models/emailSentSave')
const sgMail = require('sendgrid-v3-node');

exports.category_list = (req, res) => {
    emailSystem.find({ adminId: req.params.adminId })
        .populate('folder')
        .exec((err, categoryList) => {
            if (err) {
                res.send({ error: 'system category is not found' })
            }
            else {
                res.send(categoryList)
            }
        })
}

exports.addCategory = (req, res) => {
    var cat = {
        categoryName: req.body.categoryName,
        adminId: req.params.adminId,
        createdBy: 'admin'
    }
    var category = new emailSystem(cat);
    category.save((err, data) => {
        if (err) {
            console.log(err)
            res.send({ error: 'system category is not add' })
        }
        else {
            res.send({ msg: 'system category is add successfully', category: data })
        }
    })
}

exports.updateCategory = (req, res) => {
    emailSystem.findByIdAndUpdate(req.params.categoryId, req.body)
        .exec((err, updateCat) => {
            if (err) {
                res.send({ error: 'system category is not update' })
            }
            else {
                res.send({ msg: "system category is update successfully" })
            }
        })
}

exports.removeCategory = (req, res) => {
    emailSystem.findByIdAndRemove(req.params.categoryId)
        .exec((err, delData) => {
            if (err) {
                res.send({ error: 'system category is not delete' })
            }
            else {
                res.send({ msg: 'system category is remove successfully' })
            }
        })
}

exports.sendEmail =  (req,res)=>{
    if (!req.body.subject || !req.body.template || !req.body.to) {
        res.send({ error: "invalid input", success: false })
    } else{
    const emailData = {
            sendgrid_key: process.env.SENDGRID_API_KEY,
            to: req.body.to,
            from_email:process.env.from_email,
            from_name: 'noreply@gmail.com',
            subject: req.body.subject,
            content: req.body.template
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
                   emailSent.findByIdAndUpdate(emailSave._id,{userId:req.params.userId,email_type:'sent',category:'system'})
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