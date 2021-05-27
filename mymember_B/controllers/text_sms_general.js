const txtKey = require("../models/text_key")
const textSentSave = require("../models/textSentSave")
const generalfolder = require("../models/text_general_folder")
const accountSid = 'AC95c8e5b269c098f81fac4bbc8ce8f881';
const authToken = 'af2e5bd3153fe38cd556686959194c48';
const client = require('twilio')(accountSid, authToken);
const std = require("../models/addmember")

require('dotenv').config()
// textKey
// const MessagingResponse = require('twilio').twiml.MessagingResponse
// exports.recieve =(req,res)=>{
//  const twiml = new MessagingResponse() 
//  console.log('run')
//  twiml.messages('hello world')
//  res.writeHead(200,{'Content-Type':'text/xml'})
//  res.end(twiml.toString())
// }
// const asid = 'AC95c8e5b269c098f81fac4bbc8ce8f881';
// const authtoken = 'af2e5bd3153fe38cd556686959194c48'
// const msgService = 'ISb21aa5fdf2d5a8c60dd25d5dd7389d7f'
// const client = require('twilio')(asid, authtoken)


function TimeZone(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const date_time =str.split(',')
    console.log(date_time)
    const date = date_time[0]
    const time = date_time[1]
    return { Date:date,Time:time}
}

exports.all_chat_list = (req,res)=>{
    textSentSave.find({userId:req.params.userId})
    .select({ "sent_recieve_sms": { "$slice": -1 }})
    .exec(function(err,doc) {
        if(err){
            console.log(err)
            res.send({error:'all chat list not found'})
        }else{
            res.send({msg:doc})
        }
    })
}

exports.searchStd_chat = (req,res)=>{
    console.log(req.body.search);
  var regex = new RegExp("^" + req.body.search);
  console.log(regex);
  std.find(
      { $and: [{ userId: req.params.userId }, { firstName: regex }] },
      { firstName: 1, lastName: 1, memberprofileImage: 1, primaryPhone:1}
    )
    .exec((err, resp) => {
      if (err) {
        res.json({ code: 400, msg: "list not found" });
      } else {
        res.send({ code: 200, msg: resp });
      }
    });
}

exports.list_std_chat = async(req,res)=>{
    textSentSave.findOne({std_Id:req.params.stdId}).exec((err,resp)=>{
        if(err){
            res.send({error:'chat info no found'})
        }else{
            res.send(resp)
        }
    })
    
}

exports.send_sms = async(req,res)=>{
    var student = await std.findOne({_id:req.params.stdId})
    var stdPhone = student.primaryPhone
    var smsid = Date.now().toString()
    var code = '+91'
    console.log(`${code}`+stdPhone)
    client.messages.create({
         body: req.body.smsText,
         from: '+12672637681',
         to: `${code}`+stdPhone
        })
    .then( async(resp)=>{
        var time_date = TimeZone()
        var smsInfo = [{
             smsType:'sent',
             smsId:smsid,
             smsTxt:req.body.smsText,
             date:time_date.Date,
             time:time_date.Time
        }]
       var getStd = await textSentSave.findOne({std_Id:req.params.stdId})
       if(getStd){
        var updateStd = await textSentSave.updateOne({std_Id:req.params.stdId},{$push:{sent_recieve_sms:smsInfo}})
        if(updateStd){
            res.send({msg:'sms send successfully and chat update'})
        }else{
            res.send({error:'chat details not update'})
        }
       }
       else{ 
 
       var txtObj = new textSentSave({
        firstName:student.firstName,
        lastName:student.lastName,
        profile_pic:student.memberprofileImage,
        primaryPhone:`${code}`+stdPhone,
        sent_recieve_sms:smsInfo,
        std_Id:student._id,
        userId:req.params.userId
       })

       txtObj.save((err,resp)=>{
           if(err){
               res.send({err:'text sms detail not save'})
           }else{
            res.send({msg:'text sms send successfully'})
           }
       })
       }
    
   }).catch((err)=>{
       console.log(err)
       res.send({error:'text sms not send'})
   })


    // function sendBulkMessages(msg,to,textKey){
    //     const client = require('twilio')(textKey.ACCOUNT_SID, textKey.AUTH_TOKEN);
       
    //     var numbers = []; 
    //     for(i = 0; i < to.length; i++) 
    //     { 
    //         numbers.push(JSON.stringify({  
    //         binding_type: 'sms', address: to[i]})) 
    //     } 
       
    //     const notificationOpts = { 
    //       toBinding: numbers, 
    //       body: msg, 
    //     }; 
       
    //      client.notify 
    //     .services(textKey.MSG_SERVICE_SID) 
    //     .notifications.create(notificationOpts) 
    //     .then((resp)=>{
    //         console.log(resp)
    //         var txt = new textSentSave(req.body)
    //         txt.save((err,txtMsg)=>{
    //             if(err){
    //                 res.send({error:'txt msg not send'})
    //             }
    //             else{
    //                 textSentSave.findByIdAndUpdate(txtMsg._id,{userId:req.params.userId,category:'general',textStatus:'sent'})
    //                 .exec((err,updatetxt)=>{
    //                     if(err){
    //                         res.send({error:'user id is not add in send text'})
    //                     }
    //                     else{
    //                         res.send({msg:'text sms sent successfully'})
    //                     }
    //                 })
    //             }
    //         })
    //     }).catch((error)=>{
    //         res.send(error)
    //     })
    // } 
    // txtKey.findOne({userId:req.params.userId})
    // .exec((err,textKey)=>{
    //     if(err){
    //         res.send({Error:'text authentication key not found',error:err})
    //     }
    //     else{
    //         sendBulkMessages(req.body.msg,req.body.to,textKey)
    //     }
    // })
}

exports.save_sms =(req,res)=>{
    txtKey.findOne({userId:req.params.userId})
    .exec((err,txtData)=>{
        if(err){
            res.send({Error:'text auth key is not find'})
        }
        else{
            // console.log(txtData)
            // var dt = new Date(req.body.schedule_date)
            // console.log(dt)
            // console.log(dt.getDate())
            // console.log(new Date())
            var obj ={
                from:req.body.from,
                to:req.body.to,
                msg:req.body.msg,
                schedule_date:req.body.schedule_date,
                category:"General",
                textStatus:true,
                text_type:"schedule",
                folderId:req.params.folderId,
                userId:req.params.userId,
                ACCOUNT_SID:txtData.ACCOUNT_SID,
                AUTH_TOKEN:txtData.AUTH_TOKEN,
                MSG_SERVICE_SID:txtData.MSG_SERVICE_SID,
                twillo_no:txtData.twillo_no,
            }
            var txt = new textSentSave(obj)
            txt.save((err,txtMsg)=>{
                if(err){
                    res.send({error:'txt msg not save',Error:err})
                }
                else{
                 generalfolder.update({_id:req.params.folderId},{$push:{template:txtMsg._id}})
                 .exec((err,resp)=>{
                 if(err){
                     res.send({error:'txt msg not save in folder'})
                   }
                else{
                    res.send({msg:'txt msg is schedule successfully',data:txtMsg})
                }
            })
         }
      })
    }
  })
}

exports.remove_sms = (req,res)=>{
    textSentSave.deleteOne({_id:req.params.textId},(err,removeText)=>{
        if(err){
            res.send({error:'text sms in not delete'})
        }
        else{
            generalfolder.update({"template":req.params.textId},{$pull:{"template":req.params.textId}},
            function(err,temp){
                if(err){
                    res.send({error:'text sms details is not remove in folder'})
                }
                else{
                    res.send({msg:'text sms is remove successfully',result:temp})
                }
            })
        }
    })
}

exports.update_sms = (req,res)=>{
    textSentSave.updateOne({_id:req.params.textId},req.body,(err,updateText)=>{
        if(err){
            res.send({error:'text sms is not update'})
            console.log(err)
        }
        else{
            res.send(updateText)
        }
    })
}

exports.remove_send_recieve_sms = async(req,res)=>{
    var Id = parseFloat(req.params.smsId)
    console.log(Id, typeof Id)
    console.log(req.params.stdId,req.params.smsId)
    var data = await textSentSave.updateOne({'std_Id':req.params.stdId},{$pull:{"sent_recieve_sms":{"smsId":req.params.smsId}}})
    if(data){
        res.send({msg:'sms remove successfully'})
        console.log(data)
    }else{
        res.send({error:'sms not remove'})
    }
}


