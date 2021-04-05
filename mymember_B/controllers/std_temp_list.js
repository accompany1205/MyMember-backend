const tempList = require("../models/std_temp_list")
const student = require("../models/addmember")
const async = require('async')

exports.Email_contact_list = (req,res)=>{
tempList.find({$and:[{userId:req.params.userId,contact_type:'Email'}]})
.exec((err,emailList)=>{
  if(err){
    res.send({error:'email list is not found'})
  }
  else{
    res.send(emailList)
  }
})
}

exports.tempList_create = (req,res)=>{
var stdId = req.body.studentId
    student.find({_id:stdId})
        .select("firstName")
        .select("lastName")
        .select("email")
        .select("userId")
        .exec((err,data)=>{
         tempList.insertMany(data).then((result)=>{
             async.eachSeries(result,(obj,done)=>{
                tempList.findByIdAndUpdate(obj._id,{$set:{contact_type:req.body.contact_type}},done)
                },function Done(err,List){
                  res.send({msg:'student add in contact list'})
                })  
            }).catch((error)=>{
               res.send(error)
        })
    })
}