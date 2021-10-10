const templateFolder = require("../models/text_template_doc_folder")
const templateSubFolder = require("../models/text_template_doc_subfolder");
const UploadFiles = require("../models/text_template_doc_upload");

exports.createfolder = (req,res)=>{
  var doc = new templateFolder(req.body)
  doc.save((err,template)=>{
    if(err){
      res.send({error:'template folder is not create'})
    }
    else{
      templateFolder.findByIdAndUpdate(template._id,{$set:{userId:req.params.userId}})
        .exec((err,doc)=>{
          if(err){
            res.send({error:'user id is not add in template'})
          }
          else{
            res.send(doc)
          }
        })
    }
  })
}

exports.readfolder = (req,res)=>{
  templateFolder.find({userId:req.params.userId})
    .populate('subFolder')
    .exec((err,folderList)=>{
      if(err){
        res.send({error:'template folder is not find'})
        console.log(err)
      }
      else{
        res.send(folderList)
      }
    })
}

exports.editFolder = (req,res)=>{
  templateFolder.findByIdAndUpdate(req.params.docfolderId,req.body)
    .exec((err,updateFolder)=>{
      if(err){
        res.send({error:'template folder is not update'})
      }
      else{
        res.send({msg:'template folder is update successfully'})
      }
    })
}

exports.removeFolder = (req,res)=>{
  templateFolder.findByIdAndRemove(req.params.docfolderId)
    .exec((err,removeFolder)=>{
      if(err){
        res.send({error:'template folder is not remove'})
      }
      else{
        res.send({msg:'template folder is remove successfully'})
      }
    })
}

exports.templateList = (req,res)=>{
  UploadFiles.find({subFolderId: req.params.subfolderId})
    .populate('uploadDocument')
    .exec((err,doclist)=>{
      if(err){
        res.send({error:'template list not found'})
      }
      else{
        res.send(doclist)
      }
    })
}

exports.createSubFolder =(req,res)=>{
  var docSub = new templateSubFolder(req.body)
  docSub.save((err,subfolder)=>{
    if(err){
      res.send({error:'subfolder is not create'})
    }
    else{
      templateFolder.updateOne({_id: req.params.folderId},{$push:{subFolder:subfolder._id}})
        .exec((err,updteFolder)=>{
          if(err){
            res.send({error:'subfolder is not add in folder'})
          }
          else{
            res.send({'msg':'subfolder create successfully',SubFolder:subfolder})
          }
        })
    }
  })
}

exports.editSubFolder =(req,res)=>{
  templateSubFolder.updateOne({_id:req.params.subfolderId},req.body)
    .exec((err,updatsubFolder)=>{
      if(err){
        res.send({error:'sub folder is not update'})
      }
      else{
        res.send(updatsubFolder)
      }
    })
}

exports.removeSubFolder = (req,res)=>{
  templateSubFolder.findByIdAndRemove(req.params.subfolderId)
    .exec((err,removeFolder)=>{
      if(err){
        res.send({error:'sub folder is not remove'})
      }
      else{
        templateFolder.updateOne({"subFolder":removeFolder._id},{$pull:{"subFolder":removeFolder._id}},
          function(err,data){
            if(err){
              res.send({error:'subfolder is not remove in folder'})
            }
            else{
              res.send({msg:'subfolder is remove in folder',result:data})
            }
          })

      }
    })
}

exports.templateUpload =(req,res)=>{
  const docFileDetails = {
    template_name:req.body.template_name,
    template:req.body.template,
    subFolderId:req.params.subFolderId,
    rootFolderId: req.params.rootFolderId,
  }
  var mydoc = new UploadFiles(docFileDetails);
  mydoc.save((err,docdata)=>{
    if(err){
      res.send({error:'template is not add database'})
    }
    else{
      console.log('Doc file details: ', docFileDetails);
      templateSubFolder.updateOne({subFolderName:req.body.subFolder},{$push:docFileDetails},
        function(err,updateDoc){
          if(err){
            res.send({error:'File not added.'})
          }
          else{
            console.log('After update: ', updateDoc);
            res.send({result:updateDoc,Doc:docdata})
          }
        })
    }
  });
}

exports.templateRemove =(req,res)=>{
  const docFileDetails = {
    template:req.body.template,
  }
  UploadFiles.findOneAndRemove({template: req.body.template}, {}, function (err, doc) {
    console.log('Doc: ', doc);
    templateSubFolder.updateOne({subFolderName: req.body.subFolderName},{$pull:docFileDetails},
      function(err,updateDoc){
        if(err){
          res.send({error:'File not removed.'})
        }
        else{
          console.log('After update: ', updateDoc);
          res.send({result: updateDoc, Doc: doc});
          //res.send({result:updateDoc,Doc:docdata})
        }
      });
  });

}
