// const product = require("../models/product");
const moment = require("moment");
const buy_product = require("../models/buy_product");
const Finance_infoSchema = require("../models/finance_info");
const AddMember = require("../models/addmember");
const _ = require("lodash");
const Joi = require("@hapi/joi");
var mongo = require("mongoose");
const { valorTechPaymentGateWay } = require("./valorTechPaymentGateWay");

const createEMIRecord = require("../Services/createEMi");

const randomNumber = (length, addNumber) => {
    return parseInt(
        (Math.floor(Math.random() * length) + addNumber).toString().substring(1)
    );
};

const getUidAndInvoiceNumber = () => {
    return {
        uid: randomNumber(100000000000, 100),
        invoice_no: randomNumber(10000000, 100),
    };
};


exports.product_InfoById = async (req, res) => {
    var productID = req.params.productID;
    var userId = req.params.userId;
    try {
        productData = await buy_product.find({
            _id: productID,
            userId: userId,
        });
        res.send({
            msg: "done",
            data: productData,
        });
    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false });
    }
};
exports.buy_product = async (req, res) => {
    const userId = req.params.userId;
    const studentId = req.params.studentId;
    let valorPayload = req.body.product_details.valorPayload;
    let productData = req.body.product_details;
    const Address = valorPayload ? valorPayload.address : "";
    const payLatter = req.body.product_details.pay_latter;
    const financeId = req.body.product_details.finance_id;
    const ptype = req.body.product_details.ptype;
    delete req.body.product_details.valorPayload;
    let memberShipDoc;
    productData.userId = userId;
    try {
        if (productData.isEMI) {
            if (productData.payment_time > 0 && productData.balance > 0 && productData.payment_type !== "pif") {
                productData.schedulePayments = createEMIRecord(
                    productData.payment_time,
                    productData.payment_money,
                    productData.start_payment_date,
                    productData.createdBy,
                    productData.payment_type,
                    productData.pay_latter,
                    productData.due_every
                );
                if (valorPayload && ptype == "credit card") {
                    valorPayload.descriptor = "BETA TESTING";
                    valorPayload.product_description = "Mymember brand Product";
                    const { uid } = getUidAndInvoiceNumber();
                    delete valorPayload.subscription_starts_from;
                    delete valorPayload.Subscription_valid_for;
                    let addValorPay = valorPayload;
                    valorPayload = { ...valorPayload, uid };
                    const saleFormatedPayload = getFormatedPayload(valorPayload);
                    const resp = await valorTechPaymentGateWay.saleSubscription(
                        saleFormatedPayload
                    );
                    if (resp.data.error_no == 'S00') {
                        if (payLatter === "credit card" && req.body.product_details.payment_type === ("monthly" || "weekly")) {
                            addValorPay = { ...addValorPay, amount: productData.payment_money, subscription_starts_from: productData.schedulePayments[0].date.split('-').join(''), Subscription_valid_for: productData.schedulePayments.length - 1, ...getUidAndInvoiceNumber() };
                            const addFormatedPayload = getFormatedPayload(addValorPay);
                            const addresp = await valorTechPaymentGateWay.addSubscription(
                                addFormatedPayload
                            );
                            if (addresp.data.error_no === "S00") {
                                productData.subscription_id = addresp.data.subscription_id
                                productData.transactionId = {
                                    rrn: resp.data.rrn,
                                    txnid: resp.data.txnid,
                                    token: resp.data.token,
                                };
                                if (!financeId) {
                                    valorPayload.address = Address;
                                    valorPayload.userId = userId;
                                    valorPayload.studentId = studentId;
                                    const financeDoc = await createFinanceDoc(valorPayload);
                                    if (financeDoc.success) {
                                        productData.product_status = "Active";
                                        memberShipDoc = await createProductDocument(
                                            productData,
                                            studentId
                                        );
                                        res.send(memberShipDoc);
                                    } else {
                                        res.send({
                                            msg: "Finance and product doc not created!",
                                            success: false,
                                        });
                                    }
                                }

                                productData.product_status = "Active";
                                memberShipDoc = await createProductDocument(
                                    productData,
                                    studentId
                                );
                                res.send(memberShipDoc);

                            } else {
                                res.send({ msg: addresp.data.mesg, success: false });
                            }
                        }
                        else {
                            if (!financeId) {
                                valorPayload.address = Address;
                                valorPayload.userId = userId;
                                valorPayload.studentId = studentId;
                                const financeDoc = await createFinanceDoc(valorPayload);
                                if (financeDoc.success) {
                                    productData.product_status = "Active";
                                    memberShipDoc = await createProductDocument(
                                        productData,
                                        studentId
                                    );
                                    res.send(memberShipDoc);
                                } else {
                                    res.send({
                                        msg: "Finance and product doc not created!",
                                        success: false,
                                    });
                                }
                            }

                            productData.product_status = "Active";
                            memberShipDoc = await createProductDocument(
                                productData,
                                studentId
                            );
                            res.send(memberShipDoc);

                        }
                    }
                    else {
                        res.send({ msg: resp.data.mesg, success: false });
                    }
                }
                else if (ptype === ("cash" || "cheque")) {
                    if (!financeId) {
                        valorPayload.address = Address;
                        valorPayload.userId = userId;
                        valorPayload.studentId = studentId;
                        const financeDoc = await createFinanceDoc(valorPayload);
                        if (financeDoc.success) {
                            productData.product_status = "Active";
                            memberShipDoc = await createProductDocument(
                                productData,
                                studentId
                            );
                            res.send(memberShipDoc);
                        } else {
                            res.send({
                                msg: "Finance and product doc not created!",
                                success: false,
                            });
                        }
                    }

                    productData.product_status = "Active";
                    memberShipDoc = await createProductDocument(
                        productData,
                        studentId
                    );
                    res.send(memberShipDoc);
                }
            } else {
                res.send({
                    msg: "payment type should be weekly/monthly",
                    success: false,
                });
            }
        } else {
            productData.due_status = "paid";
            if (!productData.isEMI && productData.balance == 0 && productData.payment_type != "monthly" || "weekly") {
                if (ptype === 'credit card') {
                    if (valorPayload.pan) {
                        const { uid } = getUidAndInvoiceNumber();
                        valorPayload = { ...valorPayload, uid };
                        const FormatedPayload = getFormatedPayload(valorPayload);
                        const resp = await valorTechPaymentGateWay.saleSubscription(
                            FormatedPayload
                        );
                        if (resp.data.error_no === "S00") {
                            productData.transactionId = {
                                rrn: resp.data.rrn,
                                txnid: resp.data.txnid,
                                token: resp.data.token,
                            };

                            if (!financeId) {
                                valorPayload.address = Address;
                                valorPayload.userId = userId;
                                valorPayload.studentId = studentId;
                                const financeDoc = await createFinanceDoc(valorPayload);
                                if (financeDoc.success) {
                                    memberShipDoc = await createProductDocument(
                                        productData,
                                        studentId
                                    );
                                    res.send(memberShipDoc);
                                } else {
                                    res.send({
                                        msg: "Finace and product doc not created!",
                                        success: false,
                                    });
                                }
                            }
                            productData.product_status = "Active";
                            memberShipDoc = await createProductDocument(
                                productData,
                                studentId
                            );
                            res.send(memberShipDoc);

                        } else {
                            res.send({ msg: resp.data.mesg, success: false });
                        }
                    }
                    else {
                        res.send({
                            msg: "please provide Card Detatils",
                            success: false,
                        });
                    }
                }
                else if (ptype === ('cash' || 'cheque')) {
                    if (!financeId) {
                        valorPayload.address = Address;
                        valorPayload.userId = userId;
                        valorPayload.studentId = studentId;
                        const financeDoc = await createFinanceDoc(valorPayload);
                        if (financeDoc.success) {
                            memberShipDoc = await createProductDocument(
                                productData,
                                studentId
                            );
                            res.send(memberShipDoc);
                        } else {
                            res.send({
                                msg: "Finace and product doc not created!",
                                success: false,
                            });
                        }
                    }
                    memberShipDoc = await createProductDocument(
                        productData,
                        studentId
                    );
                    res.send(memberShipDoc);
                }
            } else {
                res.send({
                    msg: "payment type should be pif",
                    success: false,
                });
            }
        }
    } catch (error) {
        res.send({ msg: error.message.replace(/\"/g, ""), success: false });
    }
};

function getFormatedPayload(valorPayload) {
    const payload = valorPayload;
    const address = payload.address;
    delete payload.address;
    let subscriptionAddress;
    if (payload.Subscription_valid_for) {
        subscriptionAddress = {
            shipping_customer_name: payload.card_holder_name,
            shipping_street_no: address.street_no,
            shipping_street_name: address.address,
            shipping_zip: address.zip,
            billing_customer_name: payload.card_holder_name,
            billing_street_no: address.street_no,
            billing_street_name: address.address,
            billing_zip: address.zip,
        }
        return {
            ...payload,
            ...subscriptionAddress
        }
    }
    delete payload.subscription_day_of_the_month;
    delete payload.Subscription_valid_for;
    delete payload.subscription_starts_from;
    return {
        ...payload,
        ...address,
    };
}

function createProductDocument(productData, studentId) {
    return new Promise((resolve, reject) => {
        let product = new buy_product(productData);
        product.save((err, data) => {
            if (err) {
                resolve({ msg: "product not buy", success: false });
            } else {
                update = {
                    $push: { product_details: data._id },
                };
                AddMember.findOneAndUpdate(
                    { _id: studentId },
                    update,
                    (err, stdData) => {
                        if (err) {
                            resolve({
                                msg: "product id is not add in student",
                                success: false,
                            });
                        } else {
                            buy_product
                                .findOneAndUpdate(
                                    { _id: data._id },
                                    {
                                        $push: {
                                            studentInfo: stdData._id,
                                        }
                                    }
                                )
                                .exec(async (err, result) => {
                                    if (err) {
                                        resolve({
                                            msg: "student id is not add in buy membership",
                                            success: false,
                                        });
                                    } else {
                                        resolve({
                                            msg: "product purchase successfully",
                                            success: true,
                                        });
                                    }
                                });
                        }

                    })
            }
        }
        );
    }
    )
}
function createFinanceDoc(data) {
    const { studentId } = data;
    return new Promise((resolve, reject) => {
        const financeData = new Finance_infoSchema(data);
        // if (financeId) {
        //     Finance_infoSchema.findByIdAndUpdate(financeId, {
        //         $set: data
        //     }).exec((err, resData) => {
        //         if (err) {
        //             resolve({ success: false });
        //         }
        //         resolve({ success: true });
        //     })
        // } else {
        financeData.save((err, Fdata) => {
            if (err) {
                resolve({ success: false, msg: "Finance data is not stored!" });
            } else {
                AddMember.findByIdAndUpdate(studentId, {
                    $push: { finance_details: Fdata._id },
                }).exec((err, data) => {
                    if (data) {
                        resolve({ success: true });
                    } else {
                        resolve({ success: false });
                    }
                });
            }
        });
        // }
    });
}
exports.update = async (req, res) => {
    const productId = req.params.productId;
    const type = req.params.type;
    const subscription_id = req.body.subscription_id;
    const cardDetails = req.body.cardDetails;
    let expiry_date = ""
    if (cardDetails) {
        expiry_date = toString(cardDetails.expiry_month) + toString(cardDetails.expiry_year)
        delete cardDetails.expiry_month;
        delete cardDetails.expiry_year;
        cardDetails.expiry_date = expiry_date;
    }
    try {
        if (req.body.isTerminate) {
            res.status(200).send({
                msg: "Membership already terminated!",
                success: true,
            });
        } else {
            if (type == "others") {
                await buy_product.updateOne({ _id: productId }, req.body);
                res.status(200).send({
                    msg: "Membership updated successfully!",
                    success: true,
                });
            } else if (type == "freeze") {
                if (subscription_id) {
                    const freezeValorPayload = await valorTechPaymentGateWay.freezeSubscription({ subscription_id, freeze_start_date: req.body.freeze_start_date.split('-').join(''), freeze_stop_date: req.body.freeze_stop_date.split('-').join('') });
                    if (freezeValorPayload?.data?.error_no === "S00") {
                        const freezeRes = await freezeMembership(productId, req.body);
                        if (freezeRes) {
                            res.status(200).send({
                                msg: "Membership freezed successfully",
                                success: true,
                            });
                        } else {
                            res.status(400).send({
                                msg: "Membership not updated but valor freezed product!",
                                success: false,
                            });
                        }
                    } else {
                        res.status(400).send({
                            msg: "Due to the technical issue subscription not freeze please try again or later!",
                            success: false,
                        });
                    }
                } else {
                    const freezeRes = await freezeMembership(productId, req.body);
                    if (freezeRes) {
                        res.status(200).send({
                            msg: "Membership freezed successfully",
                            success: true,
                        });
                    } else {
                        res.status(400).send({
                            msg: "Membership not freezed please try again!",
                            success: false,
                        });
                    }
                }
            } else if (type == "unfreeze") {
                let unfreezeRes;
                if (subscription_id) {
                    const valorRes = await valorTechPaymentGateWay.unfreezeSubscription({ subscription_id });
                    if (valorRes.data.error_no === "S00") {
                        unfreezeRes = await unFreezeMembership(productId, req.body);
                        if (unfreezeRes) {
                            res.status(200).send({
                                msg: "Membership unfreezed successfully",
                                success: true,
                            });
                        } else {
                            res.status(400).send({
                                msg: "Membership not unfreeze in DB but valorPayTech unfreezed product!",
                                success: false,
                            });
                        }
                    } else {
                        res.status(400).send({
                            msg: "Due to internal issue product not unfreezed please try again!!",
                            success: false,
                        });
                    }
                } else {
                    unfreezeRes = await unFreezeMembership(productId, req.body);
                    if (unfreezeRes) {
                        res.status(200).send({
                            msg: "Membership unfreezed successfully",
                            success: true,
                        });
                    } else {
                        res.status(400).send({
                            msg: "Membership not unfreeze please try again!",
                            success: false,
                        });
                    }
                }
            } else if (type == "forfeit") {
                const emiId = req.body.emiId;
                const createdBy = req.body.createdBy;
                const balance = req.body.balance;
                let forfeit;
                if (subscription_id) {
                    const { uid } = getUidAndInvoiceNumber()
                    let valorRes = await valorTechPaymentGateWay.forfeitSubscription({ subscription_id, uid })
                    if (valorRes.data.error_no == "S00") {
                        await paymentProcessing(productId, emiId, balance, createdBy, type, req.body.ptype);
                        forfeit = await forfeitSubscription(productId, req.body.reason)
                        if (forfeit.success) {
                            res.status(200).send(forfeit)
                        } else {
                            res.status(400).send(forfeit)
                        }
                    } else {
                        res.status(400).send({
                            success: false,
                            msg: "Membership forfeting failed please try again!"
                        })
                    }
                } else {
                    await paymentProcessing(productId, emiId, balance, createdBy, type, req.body.ptype);
                    forfeit = await forfeitSubscription(productId, req.body.reason)
                    if (forfeit.success) {
                        res.status(200).send(forfeit)
                    } else {
                        res.status(400).send(forfeit)
                    }
                }
            } else if (type == "terminate") {
                let terminate;
                if (subscription_id) {
                    const valorDelete = await valorTechPaymentGateWay.deleteSubscription({ subscription_id });
                    if (valorDelete.data.error_no === "S00") {
                        terminate = await terminateMembership(productId, req.body.reason)
                        if (terminate.success) {
                            res.status(200).send(terminate)
                        } else {
                            res.status(400).send(terminate)
                        }
                    } else {
                        res.send({
                            msg: "Due to technical reason product not terminating please try later!",
                            success: false
                        })
                    }
                } else {
                    terminate = await terminateMembership(productId, req.body.reason)
                    if (terminate.success) {
                        res.status(200).send(terminate)
                    } else {
                        res.status(400).send(terminate)
                    }
                }
            } else if (type == "refund") {
                let refundRes;
                const balance = req.body.balance
                const emiId = req.body.emiId;
                const createdBy = req.body.createdBy;
                if (cardDetails) {
                    const { uid } = getUidAndInvoiceNumber();
                    const valorRefundRes = await valorTechPaymentGateWay.refundSubscription({ ...cardDetails, uid, amount: req.body.Amount });
                    if (valorRefundRes.data.error_no === "S00") {
                        if (emiId) {
                            await paymentProcessing(productId, emiId, balance, createdBy, type, req.body.ptype);
                        }
                        refundRes = await refundMembership(productId, req.body);
                        if (refundRes) {
                            res.status(200).send({
                                msg: "Membership refunded successfully!",
                                success: true,
                            });
                        } else {
                            res.status(400).send({
                                msg: "Refunded successfully but stundet info not updated!",
                                success: false,
                            });
                        }
                    } else {
                        res.status(400).send({
                            msg: "Due to network issue product not refunded please try again!!",
                            success: true,
                        });
                    }
                } else {
                    if (emiId) {
                        await paymentProcessing(productId, emiId, balance, createdBy, type, req.body.ptype);
                    }
                    refundRes = await refundMembership(productId, req.body);
                    if (refundRes) {
                        res.status(200).send({
                            msg: "Membership refunded successfully!",
                            success: true,
                        });
                    } else {
                        res.status(400).send({
                            msg: "Refund failed please try again!",
                            success: false,
                        });
                    }
                }
            }
        }
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
};

exports.remove = (req, res) => {
    const id = req.params.productId;
    buy_product
        .deleteOne({ _id: id })
        .then((resp) => {
            AddMember.updateOne(
                { product_details: id },
                { $pull: { product_details: id } },
                function (err, data) {
                    if (err) {
                        res.send({ error: "product is not deleted", success: false });
                    } else {
                        res.send({ msg: "product is deleted successfully", success: true });
                    }
                }
            );
        })
        .catch((err) => {
            res.send(err);
        });
};