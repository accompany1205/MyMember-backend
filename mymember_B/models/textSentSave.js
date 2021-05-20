const mongoose = require('mongoose');
const schema =  mongoose.Schema
const EmailSchema = schema({
   firstName:{
       type:String,
   },
   lastName:{
       type:String,
   },
   profile_pic:{
       type:String,
   },
   std_Id:{
       type:String
   },
   primaryPhone:{
       type:String
   },
   sent_recieve_sms:{
        type:Array
   },
   userId:{
    type:String,
   },


 
   text_type:{
      type:String  
   },
   textStatus:{
       type:Boolean,
   },
   schedule_date:{
       type:String,
   },
   category:{
       type:String,
       default:''
   },
   folderId:{
       type:String,
       require:true
   },
   ACCOUNT_SID:{
       type:String,
       require:true
   },
   AUTH_TOKEN:{
       type:String,
       require:true
   },
   MSG_SERVICE_SID:{
       type:String,
       require:true
   },
   twillo_no:{
       type:String,
       require:true
   }
},
{ timestamps:true }
)

module.exports = mongoose.model('sent_schedule_text', EmailSchema)