var testFee = require('../models/TestingFees')
const cloudUrl = require("../gcloud/imageUrl");
var _ = require('lodash')
exports.create = async (req, res) => {
    
    var test_fees = req.body;
    if(req.file){
        await cloudUrl.imageUrl(req.file).then(response => {
           test_fees.feeFile = response;
        }).catch(err => {
            res.send({msg:"file not uploaded!", success:false})
        })
    }
    var testFeeObj = new testFee(test_fees);
    testFeeObj.save(function (err, FeeData){
        if(err){
            res.send(err)
        }
        else{   
           testFee.findByIdAndUpdate(FeeData._id,{userId:req.params.userId})
           .exec((err,fee)=>{
               if(err){
                   res.send({error:'user id is not update in fee'})
               }
               else{
                   res.send(fee)
               }
           })
        }
    })
}

exports.read = (req, res) => {
    testFee.find({userId: req.params.userId}).exec((err, data) => {
        if (err){
            res.send({ error: 'test fee list is not found' })
        }
        else {
            res.send(data)
        }
    })
}

exports.fee_info = (req, res) => {
    var testID = req.params.feeId;
    testFee.findById(testID).exec((err, data) => {
        if (err) {
            res.send({ error: 'testID is not found' })
        }
        else {
            res.send(data)
        }
    })
}

exports.deletetestfee = (req, res) => {
    var testID = req.params.feeId;
    testFee.findByIdAndDelete(testID).exec((err, data) => {
        if (err) {
            res.send({ error: 'test is not delete' })
        }
        else {
            res.send({ msg: 'test is delete' })
        }
    })
};

exports.updatetestFee = async (req, res) => {
    var feeID = req.params.feeId;
    var data = req.body
    var img = ''; 
    if(req.file){
        await cloudUrl.imageUrl(req.file).then(response => {
           img = response;
        }).catch(err => {
            res.send({msg:"file not uploaded!", success:false})
        })
    }
    await testFee.findByIdAndUpdate({ _id: feeID },{
        fees_name: data.fees_name,
        fees_description: data.fees_description,
        programName: data.programName,
        total_price: data.total_price,
        color: data.color,
        feeFile:img
    })
    .exec((err,updateData)=>{
        if(err){
            res.send({msg:'fees details is not update', success:false})
        }
        else{
            res.send({msg:'fees details is update successfully', success:true})
        }
    })
}

// exports.updateStatus = (req,res)=>{
//     var feeId = req.params.feeId;
//     var status = req.params.status
//     if(status=='false')
//     {
//     testFee.findByIdAndUpdate({ _id:feeId },{$set:{ status:'true' } })
//     .exec((err,data)=>{
//         if(err){
//             res.send({error:'fee status is not update'})
//         }
//         else{
//             testFee.findById(feeId).exec((err,data)=>{
//                 res.send(data)
//                 })                       
//             }
//         })
//     }
//     else if(status=='true'){
//         testFee.findByIdAndUpdate({ _id:feeId },{$set:{ status:'false' } })
//         .exec((err,data)=>{
//         if(err){
//             res.send({error:'fee status is not update'})
//         }
//         else{
//             testFee.findById(feeId).exec((err,data)=>{
//                 res.send(data)
//                 })                       
//             }
//         })
//     }
// }