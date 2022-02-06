require('dotenv').config();
const Member = require('../models/addmember');
const RecommendedForTest = require('../models/recommendedForTest');
const Finance_infoSchema = require("../models/finance_info");
const AddMember = require("../models/addmember");
const RegisterdForTest = require('../models/registerdForTest');
const Joi = require('@hapi/joi');
const { valorTechPaymentGateWay } = require("./valorTechPaymentGateWay");
const mergeFile = require("../Services/mergeFile")
const cloudUrl = require("../gcloud/imageUrl");



const randomNumber = (length, addNumber) => {
    return parseInt(
        (Math.floor(Math.random() * length) + addNumber).toString().substring(1)
    );
};

const getUidAndInvoiceNumber = () => {
    return {
        uid: randomNumber(100000000000, 100),
    };
};

exports.getRecommededForTest = async (req, res) => {
    let userId = req.params.userId;
    // var order = req.query.order || 1
    // let sortBy = req.query.sortBy || "firstName"
    // var totalCount = await RecommendedForTest
    //     .find({
    //         "userId": userId,
    //         "isDeleted": false
    //     })
    //     .countDocuments();

    // var per_page = parseInt(req.params.per_page) || 10;
    // var page_no = parseInt(req.params.page_no) || 0;
    // var pagination = {
    //     limit: per_page,
    //     skip: per_page * page_no,
    // };
    if (!userId) {
        res.json({
            success: false,
            msg: "Please give userId into the params!!"
        })
    }

    let students = await RecommendedForTest.find({
        "userId": userId,
        "isDeleted": false
    })
    // .skip(pagination.skip)
    // .limit(pagination.limit)
    // .sort({ [sortBy]: order });
    if (!students.length) {
        res.json({
            success: false,
            msg: "data not available!"
        })
    }
    res.json({
        success: true,
        data: students,
    })
}

exports.getRegisteredForTest = async (req, res) => {
    let userId = req.params.userId;
    // let sortBy = req.query.sortBy || "fistName"
    // var order = req.query.order || 1
    // var totalCount = await RegisterdForTest
    //     .find({
    //         "userId": userId,
    //         "isDeleted": false
    //     })
    //     .countDocuments();

    // var per_page = parseInt(req.params.per_page) || 10;
    // var page_no = parseInt(req.params.page_no) || 0;
    // var pagination = { limit: per_page, skip: per_page * page_no, };
    if (!userId) { res.json({ status: false, msg: "Please give userId into the params!!" }) }

    let students = await RegisterdForTest.find({ "userId": userId, "isDeleted": false })
    // .skip(pagination.skip)
    // .limit(pagination.limit)
    // .sort({ [sortBy]: order });
    if (!students.length) { res.json({ status: false, msg: "There no data available for this query!!", data: students }) }
    res.json({ success: true, data: students })

}


exports.recomendStudent = async (req, res) => {

    let students = req.body;
    let userId = req.params.userId;
    let recommendedFortestSchema = Joi.object({
        studentId: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        memberprofileImage: Joi.string(),
        phone: Joi.string(),
        program: Joi.string().required(),
        status: Joi.string().required(),
        rating: Joi.number().required(),
        current_rank_name: Joi.string(),
        userId: Joi.string().required(),
        next_rank_name: Joi.string(),
        current_rank_img: Joi.string(),
        next_rank_img: Joi.string(),
        lastPromotedDate: Joi.string().required(),
        isRecommended: Joi.boolean().required()
    })

    try {
        if (!students.length) {
            res.json({
                status: false,
                msg: "You haven't selected any student!"
            })
        }
        const recommendedStudentsForTest = [];
        var alredyRecomend = "";
        const promises = [];
        for (let student of students) {
            if (!student.isRecommended && student.program) {
                student.userId = userId;
                await recommendedFortestSchema.validateAsync(student);
                recommendedStudentsForTest.push(student)
                let studentId = student.studentId
                promises.push(updateStudentsById(studentId))
            } else {
                alredyRecomend += `${student.firstName} ${student.lastName}, `
            }
        }
        await Promise.all(promises);
        await RecommendedForTest.insertMany(recommendedStudentsForTest);
        if (alredyRecomend) {
            res.send({
                recommendedStudentsForTest,
                success: false,
                msg: `${alredyRecomend},  either these students are alredy in recommended list or program is not selected`
            })
        }
        res.send({
            recommendedStudentsForTest,
            success: true,
            msg: "Selected students got recomended successfully.",
        })

    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }
};

const updateStudentsById = async (studentId) => {
    return Member.findByIdAndUpdate({ _id: studentId }, { isRecommended: true })
}


exports.payAndPromoteTheStudent = async (req, res) => {
    let userId = req.params.userId;
    let { cardDetails, paidAmount, studentId, financeId } = req.body;
    let updatePayment;
    if (cardDetails) {
        const { uid } = getUidAndInvoiceNumber();
        const expiry_date = cardDetails?.expiry_month + cardDetails?.expiry_year;
        cardDetails.expiry_date = expiry_date;
        delete cardDetails.expiry_month;
        delete cardDetails.expiry_year
        const valorPayload = { ...cardDetails, amount: paidAmount, uid }
        const resp = await valorTechPaymentGateWay.saleSubscription(valorPayload);
        if (resp.data.error_no == "S00") {
            const address = {
                address: cardDetails?.address,
                zip: cardDetails?.zip,
                street_no: cardDetails?.street_no,
            }
            cardDetails.address = address;
            await createFinanceDoc({ ...cardDetails, studentId: studentId, userId: userId }, financeId)
            updatePayment = await addTestPayment(req.body, userId)
            res.send(updatePayment)
        } else {
            res.send({
                success: false,
                msg: "Payment is not completed due to technical reason please try again!"
            })
        }
    } else {
        updatePayment = await addTestPayment(req.body, userId)
        res.send(updatePayment)
    }
    //If student removed by mistake and adding again to the registerd list...
    // let isStudentRegisterd = await RegisterdForTest.findOne({
    //     "studentId": studentId
    // })
    // if (isStudentRegisterd) {
    //     let removedFromRecommended = await RecommendedForTest.findOneAndUpdate({
    //         "studentId": studentId
    //     }, {
    //         "isDeleted": false
    //     });
    //     if (!removedFromRecommended) {
    //         res.json({
    //             status: false,
    //             msg: "Having issue while removing form recommeded list!!"
    //         })
    //     }

    //     let updateIsDeleted = await RegisterdForTest.findOneAndUpdate({
    //         "studentId": studentId
    //     }, {
    //         "isDeleted": false,
    //         "userId": userId
    //     }, {
    //         new: true
    //     });
    //     if (!updateIsDeleted) {
    //         res.json({
    //             status: false,
    //             msg: "Unable to reflect into the registerd again!!"
    //         })
    //     }
    //     res.json({
    //         status: true,
    //         msg: "Student successfully promoted to registerd list!!",
    //         data: updateIsDeleted
    //     })

    // } 
    //else {
    //If moving the student to the registerd list for the fist time.
    //}
}

const addTestPayment = async (payload, userId) => {
    let {
        testId,
        studentId,
        rating,
        current_rank_name,
        next_rank_name,
        current_rank_img,
        next_rank_img,
        method,
        phone,
        firstName,
        lastName,
        memberprofileImage,
        program,
        cheque_no
    } = payload;
    let registerd = await RegisterdForTest.create({
        "studentId": studentId,
        "firstName": firstName,
        "testId": testId,
        "lastName": lastName,
        "rating": rating,
        "current_rank_name": current_rank_name,
        "next_rank_name": next_rank_name,
        "userId": userId,
        "current_rank_img": current_rank_img,
        "method": method,
        "memberprofileImage": memberprofileImage,
        "next_rank_img": next_rank_img,
        "phone": phone,
        "program": program,
        "cheque_no": cheque_no
    });
    if (registerd === null) {
        return {
            status: false,
            msg: "Having some issue while register!!!!!!!"
        }
    }
    let date = new Date();
    let history = {
        "current_rank_name": current_rank_name,
        "program": program,
        "current_rank_img": current_rank_img,
        "testPaid": date,
        "promoted": date
    }
    let updatedTestPurchasing = await Member.findOneAndUpdate(studentId, {
        $push: {
            test_purchasing: testId,
            rank_update_test_history: history
        }
    }, {
        new: true
    })
    if (updatedTestPurchasing === null) {
        return {
            status: false,
            msg: "Having some issue while register!!"
        }
    }
    let removedFromRecommended = await RecommendedForTest.updateMany({
        "studentId": studentId
    }, {
        "isDeleted": true
    }, {
        new: true
    });
    if (!removedFromRecommended) {
        return {
            status: false,
            msg: "Having issue while removing form recommeded list!!"
        }
    }

    return {
        status: true,
        msg: "Student successfully promoted to registerd list!!",
        data: registerd
    }
}

function createFinanceDoc(data, financeId) {
    const { studentId } = data;
    return new Promise((resolve, reject) => {
        const financeData = new Finance_infoSchema(data);
        if (financeId) {
            Finance_infoSchema.findByIdAndUpdate(financeId, {
                $set: data
            }).exec((err, resData) => {
                if (err) {
                    resolve({ success: false });
                }
                resolve({ success: true });
            })
        } else {
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
        }
    });
}

exports.multipleDocMerge = async (req, res) => {
    let recommendedId = req.body.recommendedId;
    let docBody = req.body.docBody;
    try {
        let promises = [];
        for (let id in recommendedId) {
            let data = await RecommendedForTest.findOne({ _id: recommendedId[id] });
            console.log("--->", data)
            let studentId = data.studentId;
            console.log("--->", studentId);
            let resp = await Member.findOne({ _id: studentId });
            let mergedInfo = { ...data.toJSON(), ...resp.toJSON() }
            let fileObj = await mergeFile(docBody, mergedInfo);
            await (cloudUrl.imageUrl(fileObj)).then(data => {
                promises.push(data)
            })
        }
        await Promise.all(promises);
        res.send({ msg: "data!", data: promises, succes: true })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.deleteAll = async (req, res) => {
    let recommendIds = req.body.recommendIds;
    let promise = [];
    for (let id in recommendIds) {
        let { studentId } = RecommendedForTest.findById(recommendIds[id]);
        await Member.updateOne({ _id: studentId }, { $set: { isRecommended: false } }).then(async data => {
            await RecommendedForTest.deleteOne({ _id: recommendIds[id] }, function (err, datas) {
                if (err) { res.send({ msg: "Recommended Student Not Deleted!", success: false }) }
                promise.push(datas)
            })
        }).catch(err => {
            res.send({ msg: err.message.replace(/\"/g, ""), success: false })
        })
    }
    Promise.all(promise);
    res.send({ msg: "Selected Students Deleted Succesfully!", success: true })
}


exports.removeFromRecomended = async (req, res) => {
    let recommededId = req.params.recommendedId;
    if (!recommededId) {
        res.json({
            status: false,
            msg: "Please give the recomended id in params!"
        })
    }
    recon = await RecommendedForTest.findById(recommededId);
    let studentId = recon.studentId;
    let deleteRecommended = await Member.findOneAndUpdate(studentId, { isRecommended: false })
    if (!deleteRecommended) {
        res.json({
            status: false,
            msg: "Unable to remove the student!!"
        })
    }
    let isDeleted = await RecommendedForTest.findByIdAndDelete(recommededId);
    if (!isDeleted) {
        res.json({
            status: false,
            msg: "Unable to remove the student!!"
        })
    } else {
        res.json({
            status: true,
            msg: "The recommeded student successfully removed from the list!!"
        })

    }
}