const membershipModal = require('../models/membership')
// const cloudinary = require("cloudinary").v2
const cloudUrl = require("../gcloud/imageUrl")

exports.create = (req,res)=>{
    console.log(req.body,req.file)
    var Id = req.params.userId;
    var membershipDetails = req.body;
    var membershipObj = new membershipModal(membershipDetails);
    membershipObj.save((err,data)=>{
        if(err){
            console.log(err)
            res.send("error")
        }
        else{
        
            console.log(data)
            res.send({message:"membership created successfully",  success:true })
            // membershipModal.findByIdAndUpdate({_id:data._id},{$set:{ userId:Id }})
            // .exec((err,membershipData)=>{
            //     if(err){
            //         res.send({error:'user id is not add in membership'});
            //     }
            //     else{
            //         res.send({msg:'membership add successfully',result:membershipData});
            //     }
            // })
        
    }
 })
}

exports.read =(req,res)=>{
        membershipModal.find({userId : req.params.userId}).exec((err,data)=>{
            
            if(err){
                res.send({error:'membership list is not find'});
            }
            else{
                if(data.length>0){
                    res.send(data);    
                }
                else{
                    res.send({msg:'membership list is empty'})
                }
            }
     })
}

exports.membershipInfo =(req,res)=>{
    var membershipId = req.params.membershipId;
    membershipModal.findById(membershipId).exec((err,data)=>{
        if(err){
            res.send({error:'membership data not found'});
        }
        else{
            res.send(data);
        }
    })
}

exports.remove = (req,res)=>{
    var membershipId = req.params.membershipId;
    membershipModal.findByIdAndDelete(membershipId,(err,data)=>{
        if(err){
            res.send({error:'membership is not delete'})
        }
        else{
            res.send({error:'membership is delete successfully'})
        }
    })
}

exports.membershipUpdate =(req,res)=>{
    var membershipId = req.params.membershipId;

    membershipModal.updateOne({_id:membershipId}, req.body).exec((err,data)=>{
        if(err){
            res.send(err)
        }
        else{
            
                res.send({message:"membership updated successfully", success:true })
            
        }
    })
}

