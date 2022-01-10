var product = require('../models/product')
const cloudUrl = require("../gcloud/imageUrl");
var productFolders = require('../models/productFolder')
var _ = require('lodash')
exports.create = async (req, res) => {
    try {
        const productDetails = req.body;
        productDetails.userId = req.params.userId;
        productDetails.adminId = req.params.adminId;
        productDetails.folderId = req.params.folderId;
        const promises = []
        if (req.files) {
            (req.files).map(file => {
                if (file.originalname.split('.')[0] === "thumbnail") {
                    cloudUrl.imageUrl(file)
                        .then(data => {
                            productDetails.productThumbnail = data
                        })
                        .catch(err => {
                            res.send({ msg: "thumbnail not uploaded!", success: false })
                        })
                } else {
                    promises.push(cloudUrl.imageUrl(file))
                }
            });
            var docs = await Promise.all(promises);
        }
        productDetails.productFile = docs;
        if (!productDetails.productFile) {
            res.send({ msg: "no file uploaded!", success: false })
        }
        var productObj = new product(productDetails);
        productObj.save((err, productData) => {
            if (err) {
                res.send({ msg: "product not created!", success: err })
            }
            else {
                productFolders.findByIdAndUpdate(req.params.folderId, { $push: { products: productData._id } })
                    .exec((err, product) => {
                        if (err) {
                            res.send({ msg: 'product not added in folder', success: false })
                        }
                        else {
                            res.send({ msg: "product created successfully", success: true })
                        }
                    })
            }
        })
    }
    catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}
exports.read = (req, res) => {
    const adminId = req.params.adminId
    const userId = req.params.userId

    product.find({ $and: [{ userId: { $in: [userId] } }, { adminId: adminId }] }).exec((err, data) => {
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
    const productId = req.params.productId;
    const adminId = req.params.adminId
    const userId = req.params.userId;
    try {
        product.findOneAndRemove(
            { _id: productId, $and: [{ userId: userId }, { adminId: adminId }] })
            .exec((err, data) => {
                if (err) {
                    res.send({ error: 'product is not delete' })
                }
                else {
                    if (!data) {
                        return res.status(401).send({
                            msg: "This is system generated membership Only admin can delete",
                            success: false,
                        });
                    }
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
        var productData = req.body
        const productId = req.params.productId;
        const adminId = req.params.adminId
        const userId = req.params.userId;
        const new_folderId = req.body.folderId;
        const old_folderId = req.body.old_folderId;
        const promises = []
        if (req.files) {
            (req.files).map(file => {
                if (file.originalname.split('.')[0] === "thumbnail") {
                    cloudUrl.imageUrl(file)
                        .then(data => {
                            productData.productThumbnail = data
                        })
                        .catch(err => {
                            res.send({ msg: "thumbnail not uploaded!", success: false })
                        })
                } else {
                    promises.push(cloudUrl.imageUrl(file))
                }
            });
            var docs = await Promise.all(promises);
            productData.productFile = docs;
        }
        product
            .updateOne({ _id: membershipId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: productData })
            .exec(async (err, updateData) => {
                if (err) {
                    res.send({ msg: err, success: false })
                }
                else {
                    if (updateData.n < 1) {
                        return res.status(401).send({
                            msg: "This is system generated membership Only admin can update",
                            success: false,
                        });
                    }
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