var testFee = require('../models/TestingFees')
const cloudUrl = require("../gcloud/imageUrl");
var productFolders = require('../models/productFolder')
var _ = require('lodash')
exports.create = async (req, res) => {

    var test_fees = req.body;
    test_fees.userId = req.params.userId;
    if (req.file) {
        await cloudUrl.imageUrl(req.file).then(response => {
            test_fees.feeFile = response;
        }).catch(err => {
            res.send({ msg: "file not uploaded!", success: false })
        })
    }
    //folderId in routes, path variable;
    test_fees.folderId = req.params.folderId;
    var testFeeObj = new testFee(test_fees);
    testFeeObj.save(function (err, FeeData) {
        if (err) {
            res.send({ msg: "product not added!", success: true })
        }
        else {
            productFolders.findByIdAndUpdate(req.params.folderId, { $push: { TestFeess: FeeData._id } })
                .exec((err, fee) => {
                    if (err) {
                        res.send({ msg: 'folder is not update in fee', success: false })
                    }
                    else {
                        res.send({ msg: "updated to folder", success: true })
                    }
                })
        }
    })
}

exports.read = (req, res) => {
    testFee.find({ userId: req.params.userId }).exec((err, data) => {
        if (err) {
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
    try {
        testFee.findByIdAndDelete(testID).exec((err, data) => {
            if (err) {
                res.send({ error: 'test is not delete' })
            }
            else {
                productFolders.updateOne({ TestFeess: data._id },
                    { $pull: { TestFeess: data._id } },
                    function (err, temp) {
                        if (err) {
                            res.send({
                                msg: "product is not remove from folder",
                                success: false,
                            });
                        } else {
                            res.send({
                                msg: "product is remove successfully",
                                success: true,
                            });
                        }
                    })
            }
        })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
};

exports.updatetestFee = async (req, res) => {
    var feeID = req.params.feeId;
    var data = req.body
    const new_folderId = req.body.folderId;
    const old_folderId = req.body.old_folderId;
    try {
        var img = '';
        if (req.file) {
            await cloudUrl.imageUrl(req.file).then(response => {
                img = response;
            }).catch(err => {
                res.send({ msg: "file not uploaded!", success: false })
            })
        }
        testFee.updateOne({ _id: feeID }, req.body).exec(async (err, updateData) => {
            if (err) {
                res.send({ msg: 'fees details is not update', success: false })
            }
            else {
                if (img) {
                    await testFee.findByIdAndUpdate({ _id: feeID }, { $set: { feefile: img } })
                }
                await productFolders.findByIdAndUpdate({_id: new_folderId}, {
                    $addToSet: { TestFeess: feeID },
                });
                productFolders
                    .findByIdAndUpdate({_id:old_folderId}, {
                        $pull: { TestFeess: feeID },
                    })
                    .exec((err, temp) => {
                        if (err) {
                            res.send({
                                msg: "product is not update from folder",
                                success: false,
                            });
                        } else {
                            res.send({
                                msg: "product is updated successfully",
                                success: true,
                            });
                        }
                    });
            }
        })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }

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