var product = require('../models/product')
const cloudUrl = require("../gcloud/imageUrl");
var productFolders = require('../models/productFolder')
var _ = require('lodash')
exports.create = async (req, res) => {

    var producBody = req.body;
    producBody.userId = req.params.userId;
    producBody.folderId = req.params.folderId;
    if (req.file) {
        await cloudUrl.imageUrl(req.file).then(response => {
            producBody.productFile = response;
        }).catch(err => {
            res.send({ msg: "attachment  not uploaded!", success: false })
        })
    }
    var productObj = new product(producBody);
    productObj.save(function (err, productData) {
        if (err) {
            res.send({ msg: "product not added!", success: false })
        }
        else {
            productFolders.findByIdAndUpdate(req.params.folderId, { $push: { products: productData._id } })
                .exec((err, product) => {
                    if (err) {
                        res.send({ msg: 'not updated to folder', success: false })
                    }
                    else {
                        res.send({ msg: "product added successfully to folder", success: true })
                    }
                })
        }
    })
}

exports.read = (req, res) => {
    product.find({ userId: req.params.userId }).exec((err, data) => {
        if (err) {
            res.send({ msg: 'product list is not found' })
        }
        else {
            res.send({ data, success: true })
        }
    })
}

exports.product_info = (req, res) => {
    var productId = req.params.productId;
    product.findById(productId).exec((err, data) => {
        if (err) {
            res.send({ msg: 'productId is not found', success: true })
        }
        else {
            res.send(data)
        }
    })
}

exports.deleteproduct = (req, res) => {
    var productId = req.params.productId;
    try {
        product.findByIdAndDelete(productId).exec((err, data) => {
            if (err) {
                res.send({ error: 'product is not delete' })
            }
            else {
                productFolders.updateOne({ products: data._id },
                    { $pull: { products: data._id } },
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
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
};

exports.updateproduct = async (req, res) => {

    try {
        var productId = req.params.productId;
        const new_folderId = req.body.folderId;
        const old_folderId = req.body.old_folderId;
        var img = '';
        if (req.file) {
            await cloudUrl.imageUrl(req.file).then(response => {
                img = response;
                product.findByIdAndUpdate(productId, { $set: { productFile: img } })

            }).catch(err => {
                res.send({ msg: "attachments not uploaded!", success: false })
            })
        }
        product.updateOne({ _id: productId }, req.body).exec(async (err, updateData) => {
            if (err) {
                res.send({ msg: err, success: false })
            }
            else {

                await productFolders.findByIdAndUpdate(new_folderId, {
                    $addToSet: { products: productId },
                });
                productFolders
                    .findByIdAndUpdate(old_folderId, {
                        $pull: { products: productId },
                    })
                    .exec((err, temp) => {
                        if (err) {
                            res.send({
                                msg: "product  is not update from folder",
                                success: false,
                            });
                        } else {
                            res.send({
                                msg: "product  updated successfully",
                                success: true,
                            });
                        }
                    });
            }
        })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }

}

// exports.updateStatus = (req,res)=>{
//     var productId = req.params.productId;
//     var status = req.params.status
//     if(status=='false')
//     {
//     product.findByIdAndUpdate({ _id:productId },{$set:{ status:'true' } })
//     .exec((err,data)=>{
//         if(err){
//             res.send({error:'product status is not update'})
//         }
//         else{
//             product.findById(productId).exec((err,data)=>{
//                 res.send(data)
//                 })                       
//             }
//         })
//     }
//     else if(status=='true'){
//         product.findByIdAndUpdate({ _id:productId },{$set:{ status:'false' } })
//         .exec((err,data)=>{
//         if(err){
//             res.send({error:'product status is not update'})
//         }
//         else{
//             product.findById(productId).exec((err,data)=>{
//                 res.send(data)
//                 })                       
//             }
//         })
//     }
// }