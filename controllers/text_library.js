const textLibrary = require("../models/text_library")

exports.category_list = (req,res)=>{
    textLibrary.find({userId:req.params.userId})
    .populate('folder')
    .exec((err,categoryList)=>{
        if(err){
            res.send({msg:'text library category is not found'})
            console.log(err)
        }
        else{
            res.send({result:categoryList})
        }
    })
}

exports.addCategory = (req,res)=>{
    var cat ={
        categoryName: req.body.categoryName,
        userId: req.params.userId
    }
    var lib_category = new textLibrary(cat);
    lib_category.save((err,data)=>{
        if(err){
            res.send({msg:'text library category is not add'})
        }
        else{
            res.send({msg:'text library category is add successfully',category:data})
        }
    })
}

exports.updateCategory =(req,res)=>{
    textLibrary.findByIdAndUpdate(req.params.categoryId,req.body)
    .exec((err,updateCat)=>{
        if(err){
            res.send({msg:'text library category is not update'})
        }
        else{
            res.send({msg:"text library category is update successfully"})
        }
    })
}

exports.removeCategory =(req,res)=>{
    textLibrary.findByIdAndRemove(req.params.categoryId)
    .exec((err,removeCat)=>{
        if(err){
            res.send({msg:'text library category is not remove'})
        }
        else{
            res.send({msg:'text library category remove successfully'})
        }
    })
}