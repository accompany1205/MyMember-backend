const TestModal = require("../models/Test");
const TestReg = require("../models/Test_reg")
const student = require("../models/addmember");
const program = require("../models/program")
const manage_change_rank = require("../models/change_rank")
var async = require('async')


exports.create = (req,res)=>{
    req.body.forEach((element) => {
        student.find({_id:element.stdList})
        .select('firstName')
        .select('lastName')
        .select('studentBeltSize')
        .select('category')
        .select('program')
        .select('programColor')
        .select('memberprofileImage')
        .select('current_rank_name')
        .select('current_rank_img')
        .select('next_rank_id')
        .select('next_rank_name')
        .select('next_rank_img')
        .exec((err,data)=>{
            if(err){
                res.send(err)
            }
            else{
             TestModal.insertMany(data).then(async(result)=>{
               await Promise.all(data.map(async(item)=>{
                  var pDetail = await program.findOne({programName:item.program}) 
                  console.log(pDetail.color)
                  var testUpdate = await TestModal.updateOne({_id: item._id },{ $set : {userId: req.params.userId,start_date:req.body.start_date,programColor:pDetail.color,programId:pDetail._id  }});
                  console.log('tttttttt', testUpdate)
               })).then((respT)=>{
                   res.send({msg:'student add in test section'})
               })
        }).catch((err)=>{
            res.send({error:"student is already exist in test"})
        })
            }
        })
    });
   
}

exports.list_std = async(req,res)=>{
  try
  {
    var data = await TestModal.find({userId:req.params.userId})
    var Count = await TestModal.find({userId:req.params.userId}).count()
    res.send({list:data,count:Count})
  }catch(e){
      res.send({error:'student data not found'})
  }
    
}

exports.testReg = async(req,res)=>{
    var testData = await TestModal.findOne({_id:req.body.stdId})
    if(testData){   
        if(req.body.p_type == 'Cash'){
        var testReg = new TestReg(testData)
        console.log(testReg)
        testReg.save((err,resp)=>{
            if(err){
                res.send({error:'student not register in test register section'})
            }else{
                res.send({msg:'student add in test register section'})
            }
        })
    }
     }else{
        res.send({error:'student id not get'})
    }
}

exports.testReg_list = async(req,res)=>{
    try{
        var regTest = await TestReg.find({userId:req.params.userId})
        var regTestCount = await TestReg.find({userId:req.params.userId}).count()
        res.send({list:regTest,count:regTestCount})
       }catch(e){
           console.log(e)
           res.send({error:'test register student not found'})
       }

}

exports.testStd_remove = (req,res)=>{
    TestModal.remove({_id:req.params.stdId}).exec((err,resp)=>{
        if(err){
            res.send({error:'student not remove'})
        }else{
            res.send({msg:'student remove successfully'})
        }
    })
}

exports.testregStd_remove = (req,res)=>{
    TestReg.remove({_id:req.params.stdId}).exec((err,resp)=>{
        if(err){
            res.send({error:'student not remove in test register section'})
        }else{
            res.send({msg:'student remove successfully in test register section'})
        }
    })
}

exports.promote_std =(req,res)=>{
    program.findOne({_id:req.params.proId},{usert:true})
    .populate({
        path:'program_rank',
        model:'Program_rank',
        match:{'_id':{$gte:req.params.nxt_rank_id}},
        options: { sort: {'_id': 1}, limit: 2},
        select:('rank_name rank_image')
    })
    .exec((err,proF)=>{
        if(err){
            res.send(err)
        }
        else{
            var rank1 =  proF.program_rank[0]
            var rank2 = proF.program_rank[1]
            manage_change_rank.updateOne({stdId:req.params.stdId},
            {$set:{current_rank_name:rank1.rank_name,
                   current_rank_img:rank1.rank_image,
                   next_rank_name:rank2.rank_name,
                   next_rank_img:rank2.rank_image}},
                (err,updte1)=>{
                    if(err){
                        res.send(err)
                    }
                    else{
                       TestModal.remove({_id:req.params.stdId},(err,resp)=>{
                                    if(err){
                                        res.send(err)
                                    }
                                    else{
                                        res.send({msg:'student promote successfully'})
                                    }
                                })
                            }
                       })
                   }
            })
}


