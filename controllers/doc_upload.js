const docfile = require("../models/doc_upload")
const docsubfolder = require("../models/doc_subfolder")
const {Storage} = require("@google-cloud/storage")
const sampleFile = require("../models/admin/upload_sample_file")
const std = require("../models/addmember")

// var uid = require("uuid")
// var uidv1 = uid.v1
require("dotenv").config()
const storage = new Storage({projectId: process.env.GCLOUD_PROJECT,credentials:{client_email:process.env.GCLOUD_CLIENT_EMAIL,private_key:process.env.GCLOUD_PRIVATE_KEY}})
const bucket = storage.bucket(process.env.GCS_BUCKET)

exports.docupload =(req,res)=>{
  const docFileDetails = {
    document_name:req.body.document_name,
    document:req.body.document,
    subFolderId:req.params.subFolderId,
    rootFolderId: req.params.rootFolderId,
  }
  var mydoc = new docfile(docFileDetails);
  mydoc.save((err,docdata)=>{
    if(err){
      res.send({error:'document is not add database'})
    }
    else{
      console.log('Doc file details: ', docFileDetails);
      docsubfolder.updateOne({subFolderName:req.body.subFolder},{$push:docFileDetails},
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

exports.docremove =(req,res)=>{
  const docFileDetails = {
    document:req.body.document,
  }
  docfile.findOneAndRemove({document: req.body.document}, {}, function (err, doc) {
    console.log('Doc: ', doc);
    docsubfolder.updateOne({subFolderName: req.body.subFolderName},{$pull:docFileDetails},
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

exports.file_sample =(req,res)=>{
    sampleFile.findOne()
    .select('sample_file')
    .exec((err,doc_sample)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send(doc_sample)
        }
    })
}

exports.groupList =(req,res)=>{
  std.aggregate([
        {$match:{$and:[{userId:req.params.userId}]}},
        {$group: {
           _id: "$studentType",
           list:{$push: {   firstName:"$firstName",
                            lastName:"$lastName",
                            primaryPhone:"$primaryPhone",
                            email:"$email",
                            studentBeltSize:"$studentBeltSize",
                            program:"$program",
                            age:"$age"
                        }},

       }},
    ]).exec((err,sList)=>{
        if(err){
            res.send(err)
        }
        else{
            var d = sList
            std.aggregate([
                {$match:{$and:[{userId:req.params.userId}]}},
                {$group: {
                   _id: "$leadsTracking",
                   list:{$push: {   firstName:"$firstName",
                                    lastName:"$lastName",
                                    primaryPhone:"$primaryPhone",
                                    email:"$email",
                                    studentBeltSize:"$studentBeltSize",
                                    program:"$program",
                                    age:"$age"
                                }},

               }}
            ]).exec((err,resp)=>{
                for(row of resp){
                      d.push(row)
                }
               res.send(d)
            })
        }
    })
}
