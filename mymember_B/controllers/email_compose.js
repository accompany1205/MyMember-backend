const user = require('../models/user')
const emailCompose = require('../models/email_compose')
const emailSent = require('../models/emailSentSave')
const  Member = require('../models/addmember') 
const sgMail = require('sendgrid-v3-node');
const AuthKey = require('../models/email_key')
// sgMail.setApiKey(process.env.email);

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

exports.smartList = (req,res)=>{
    Member.aggregate([
        {$match:{$and:[{userId:req.params.userId},{status:'Active'}]}},
        {$group: {
           _id: "$studentType",
           "count": { "$sum": 1 },
           list:{$push: {firstName:"$firstName",lastName:"$lastName", primaryPhone:"$primaryPhone",email:"$email",status:"$status"}},
       }}
    ]).exec((err,sList)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send(sList)
        }
    })
}

exports.category_list =(req,res)=>{
    emailCompose.find({userId:req.params.userId})
    .populate('folder')
    .exec((err,categoryList)=>{
        if(err){
            res.send({error:'compose category is not found'})
            console.log(err)
        }
        else{
            res.send(categoryList)
        }
    })
}

exports.sendEmail = (req,res)=>{
    AuthKey.findOne({userId:req.params.userId})
    .exec((err,datakey)=>{
        
        if(err){
            res.send(err)
        }
        else{
            console.log(datakey)
            const emailData = {
                sendgrid_key: datakey.auth_key,
                to: req.body.to,
                from_email: req.body.from,
                from_name: 'noreply@gmail.com',
            };
            
            emailData.subject = req.body.subject;
            emailData.content = req.body.template;
        
            sgMail.send_via_sendgrid(emailData).then(resp=>{
               console.log(resp)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
               var emailDetail =  new emailSent(req.body)
               console.log(emailDetail)
               emailDetail.save((err,emailSave)=>{
                   if(err){
                       res.send({error:'email details is not save'})
                       console.log(err)
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
                res.send({error:'email not send'})
                console.log(err)
            })
        }
    })
}

exports.addCategory =(req,res)=>{
    var cat ={
        categoryName: req.body.categoryName,
        userId: req.params.userId
    }
    var category = new emailCompose(cat);
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
    emailCompose.findByIdAndUpdate(req.params.categoryId,req.body)
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
    var categoryId = req.params.categoryId;
    emailCompose.findByIdAndDelete(categoryId,(err,delData)=>{
        if(err){
            res.send({error:'category is not delete'})
        }
        else{
            res.send({msg:'category is remove successfully'})
        }
    })
}