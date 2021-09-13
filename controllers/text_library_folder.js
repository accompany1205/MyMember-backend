const txtFolderLibrary = require("../models/text_library_folder")
const txtLibraryCat = require("../models/text_library")

exports.create_folder =(req,res)=>{
    var folderLObj = new txtFolderLibrary(req.body)
    folderLObj.save((err,folder)=>{
        if(err){
            res.send({error:'text library folder is not create'})
            console.log(err)
        }
        else{
            txtLibraryCat.findByIdAndUpdate(req.params.catId,{$push:{ folder:folder._id }})
            .exec((err,folderUpdate)=>{
                if(err){
                    res.send({error:'text library folder id is not push in category'})
                }
                else{
                    res.send({msg:'text library folder create successfully',data:folder})
                }
            })
        }
    })
}

exports.update_folder = (req,res)=>{
    txtFolderLibrary.findByIdAndUpdate(req.params.folderId,{$set:{folderName:req.body.folderName}})
        .exec((err,updateFolder)=>{
            if(err){
                res.send({error:'text library folder is not update'})
            }
            else{
                res.send({msg:'text library folder is update successfully'})
            }
        })
}

exports.delete_folder = (req,res)=>{
    txtFolderLibrary.findOneAndRemove({_id:req.params.folderId},(err,delFolder)=>{
        if(err){
            res.send({error:'text library folder is not remove'})
        }
        else{
            txtLibraryCat.updateOne(
            {"folder":req.params.folderId},
            {$pull:{ "folder":req.params.folderId }},
            (err,data)=>{
                if(err){
                    res.send({error:'library folder is not remove in compose category'})
                }
                else{
                    res.send({msg:'library folder remove successfully'})
                }
            })
        }
    })
}
