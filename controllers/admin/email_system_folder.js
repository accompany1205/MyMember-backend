const folderSystem = require("../../models/email_system_folder");
const systemCat = require('../../models/email_system_Category')

exports.create_folder = (req,res)=>{
    var folder={
        folderName:req.body.folderName,
    }
    var folderObj = new folderSystem(folder)
    folderObj.save((err,folder)=>{
        if(err){
            res.send({error:'system folder is not create'})
        }
        else{
            systemCat.findByIdAndUpdate(req.params.catId,{$push:{ folder:folder._id }})
            .exec((err,folderUpdate)=>{
                if(err){
                    res.send({error:'system folder id is not push in category'})
                }
                else{
                    res.send({msg:'system folder create successfully',data:folder})
                }
            })
        }
    })
}

exports.update_folder = (req,res)=>{
    folderSystem.findByIdAndUpdate(req.params.folderId,{$set:{folderName:req.body.folderName}})
    .exec((err,updateFolder)=>{
        if(err){
            res.send({error:'system folder is not update'})
        }
        else{
            res.send({msg:'system folder is update successfully'})
        }
    })
}

exports.delete_folder = (req,res)=>{
    folderSystem.findOneAndRemove({_id:req.params.folderId},(err,delFolder)=>{
        if(err){
            res.send({error:'system folder is not remove'})
        }
        else{
            systemCat.update({"folder":req.params.folderId},{$pull:{ "folder":req.params.folderId }},(err,data)=>{
                if(err){
                    res.send({error:'system folder is not remove in compose category'})
                }
                else{
                    res.send({msg:'system folder remove successfully'})
                }
            })
        }
    })
}