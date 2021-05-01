const candidateModal = require("../models/candidates");
const candidate_stripe = require("../models/candidates_stripe")
const addmemberModal = require("../models/addmember");
const User = require("../models/user")
const stripe = require("../models/stripe");
const mongo = require('mongoose')

exports.create_candidate = async (req, res) => {
    var ary = []
    var std = await addmemberModal.find({_id:req.body.studentId},{firstName:1,lastName:1,program:1,category:1,memberprofileImage:1})
    .populate('membership_details','expiry_date')
    // res.send(std)
    await Promise.all(std.map(async (item) => {
        var obj ={}
        obj.firstName = item.firstName
        obj.lastName = item.lastName
        obj.program = item.program
        obj.category = item.category
        obj.memberprofileImage = item.memberprofileImage
        obj.userId = req.params.userId
        var membershipDetails = item.membership_details
        for (row of membershipDetails){
            var expiry_date = row.expiry_date;
        }
        obj.expiry_date = expiry_date
        ary.push(obj)
    })).then((resp)=>{
        candidateModal.insertMany(ary).then((result)=>{
        res.send(result)
    }).catch((error)=>{
        res.send('cadidate already registered')
    })
    }).catch((err)=>{
        res.send(err)
    })
}

exports.create_candidateStripe = async(req,res)=>{
    var stripeName = req.body.stripeName;
    var candidate = await candidateModal.findOne({_id:req.params.candidateId})
    if(candidate){
    console.log(candidate)
    
    var cStripe = new candidate_stripe(candidate)
    cStripe.candidate_status = stripeName
    cStripe.current_stripe =`${stripeName}`+'#'+'0'
    cStripe.next_stripe =`${stripeName}`+'#'+'1'
    cStripe.userId = req.params.userId
    console.log(cStripe)
    candidate_stripe.insertMany(cStripe).then((resp)=>{
        res.send({msg:'candidate  add in stripe'})
    }).catch((error)=>{
        res.send({error:'candidate not add in stripe'})
    })


    }else{
        res.send({error:'candidate id not found'})
    }
    

//    candidateModal.findByIdAndUpdate(req.params.candidateId,{$set:{candidate_status : stripeName, current_stripe:cs, next_stripe:ns}})          
//    .exec((err,data)=>{
//        console.log(data)
//        if(err){
//            res.send({error:'candidate status is not update'})
//        }
//        else{
//             res.send({msg:'candidate status is update'})
//        }
//    })

}

exports.candidate_List = (req,res)=>{
    var id = req.params.userId
    var objId = mongo.Types.ObjectId(id)
    console.log(objId,typeof objId)
    User.aggregate([
            {$match: {_id:objId}},
                {
                    $lookup: { 
                        from: 'candidates', 
                        as: 'candidate' ,
                        let:{userId:"_id"},
                        pipeline:[
                             {$match:{$expr:{$eq:['userId','userId']}}},
                        ]
                    },   
                },
                {
                    $lookup: { 
                        from: 'stripes', 
                        as: 'stripe' ,
                        let:{userId:"_id"},
                        pipeline:[
                             {$match:{$expr:{$eq:['userId','userId']}}},
                             {$project:{stripeName:1}}
                        ]
                    },   
                },
                {
                    $project:{
                        candidate:1,
                        stripe:1
                    }
                }
            ]).exec((err,candidate)=>{
                if(err){
                    res.send({error:'candidate list not found'})
                    console.log(err)
                }
                else{
                    res.send(candidate)
                }
            })

}

exports.candidate_Stripe = (req,res)=>{
    candidate_stripe.find({userId:req.params.userId}).exec((err,resp)=>{
        if(err){
            res.send({error:'cadidate stripe student not found'})
        }else{
            res.send(resp)
        }
    })
}

exports.promote_stripe = (req,res)=>{
    console.log(req.body)
    var cStripe = req.body.current_stripe
    var stripe_split = cStripe.split('#')
    var no_stripe = stripe_split[1]
    console.log(no_stripe)
    var change_no = parseInt(no_stripe)+1
    var n_change_no = parseInt(no_stripe)+2
    var update_cur_stripe =  stripe_split[0]+'#'+`${change_no.toString()}`
    var next_cur_stripe =  stripe_split[0]+'#'+`${n_change_no.toString()}`
    console.log(update_cur_stripe,next_cur_stripe)
    candidate_stripe.findByIdAndUpdate({_id: req.params.candidateId},{$set:{current_stripe: update_cur_stripe,next_stripe:next_cur_stripe}})
    .exec((err,promote)=>{
        if(err){
            res.send({error:'stripe is not promote'})
        }
        else{
            res.send({msg:'stripe is promote'})
        }
    })
}

//delete candidate in candidate section
exports.delete_candidate = (req,res)=>{
    candidateModal.remove({_id:req.params.candidateId},(err,delCandidate)=>{
        if(err){
            res.send({error:'candidate is not remove'});
        }
        else{
            candidate_stripe.remove({_id:req.params.candidateId},(err,delCandidate)=>{
                if(err){
                    res.send({error:'candidate stripe student is not remove'});
                }
                else{
                    res.send({msg:'candidate remove successfully'});
                }
            })
        }
    })
}

//delete candidate in candidate stripe section
exports.delete_candidate_stripe = (req,res)=>{
    candidate_stripe.remove({_id:req.params.candidateId},(err,delCandidate)=>{
        if(err){
            res.send({error:'candidate stripe student is not remove'});
        }
        else{
            res.send({msg:'candidate stripe student is remove'});
        }
    })
}

