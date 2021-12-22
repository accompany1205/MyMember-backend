const pcategory = require("../models/pcategory");
const program = require("../models/program");

exports.read = (req,res)=>{
    var categoryId = req.params.categoryId;
    pcategory.findById(categoryId)
             .populate('program_subcategory')
             .exec((err,data)=>{
                if(err){
                    res.send({error:'subcategory is not populate'})
                }
                else{
                    res.send(data)
                }
            })
}

exports.catList = (req,res)=>{
    // {userId:req.params.userId}
    pcategory.find()
    .populate('program_subcategory')
    .exec((err,catlist)=>{
        if(err){
            res.send({error:'program category list not found'})
        }
        else{
            res.send(catlist)
        }
    })
}

exports.create = (req,res)=>{
    var category = req.body.category;
    var programName = req.body.programName;
   
    var categoryDetails={}
    categoryDetails.category = category;
    categoryDetails.programName = programName;
    categoryDetails.userId = req.params.userId;

                var categoryObj = new pcategory(categoryDetails)
                categoryObj.save((err,categoryData)=>{
                    if(err){
                        res.send(err)
                    }   
                    else{
                        program.updateOne({programName:programName},{$push:{ program_category : categoryData._id }})
                            .exec((err,data)=>{
                                if(err){
                                    res.send({error:'category is not added'})
                                }
                                else{
                                  res.send({msg:'category added successfully',category:categoryData})
                                }
                            })
                    }
                })        
            }
    


exports.update = (req,res)=>{
    var categoryId = req.params.categoryID;
    // var programID = req.params.programID;
    var category_name = req.body.category;
    pcategory.updateOne({ _id: categoryId }, req.body)
    .then((result) => {
        
            pcategory.findByIdAndUpdate(categoryId,{$set:{category:category_name}})
            .then((response) => {
                res.json(response)
                res.send({msg:'category added successfully',result})
                
            }).catch((err) => {
                res.send(err);
            })
            
        
    })
    .catch((err) => {
        res.send(err);
    })
    
   
}

exports.remove = (req,res)=>{
    var categoryId = req.params.categoryId;
          pcategory.findOneAndRemove({_id:categoryId},(err,data)=>{
                if(err){
                    res.send({error:'category is not delete'})
                }
                else{
                  program.update({"program_category":categoryId},{$pull:{"program_category":categoryId}},
                    function(err,data){
                        if(err){
                            res.send({error:'category is not delete from program'})
                        }
                        else{
                            res.send({error:'category is delete from program'})
                        }
                    })
                }
            })
    }   






