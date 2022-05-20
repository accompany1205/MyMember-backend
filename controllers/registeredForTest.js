require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedForTest = require('../models/recommendedForTest');
const RegisterdForTest = require('../models/registerdForTest');
const Program = require('../models/program');
const program_rank = require("../models/program_rank");
const student_info_Rank = require('../models/student_info_Rank')
const cloudUrl = require("../gcloud/imageUrl");
const mergeFile = require("../Services/mergeFile")
const mergeMultipleFiles = require("../Services/mergeMultipleFiles");




exports.payforPromotedstudens = async (req, res) => {
    let promtedId = req.params.promtedId;
    promotedBody = req.body
    let registerd = {
        "testId": promotedBody.testId,
        "method": promotedBody.method,
        "cheque_no": promotedBody.cheque_no,
        "isPaid": promotedBody.isPaid
    };
    RegisterdForTest.findOneAndUpdate({ _id: promtedId }, { $set: registerd },
        (err, data) => {
            if (err) {
                return res.send({
                    success: false,
                    msg: "Having some issue while register!"
                })
            }
            else {
                let history = {
                    "current_rank_name": promotedBody.current_rank_name,
                    "program": promotedBody.program,
                    "current_rank_img": promotedBody.current_rank_img,
                    "testPaid": new Date(),
                    "promoted": new Date()
                }
                Member.findOneAndUpdate({ _id: promotedBody.studentId },
                    {
                        $push: {
                            test_purchasing: promotedBody.testId,
                            rank_update_test_history: history
                        }
                    }, (err, data) => {
                        if (err) {
                            return res.send({
                                success: false,
                                msg: "Having some issue while register!!"
                            })
                        }
                        else {

                            return res.send({
                                success: true,
                                msg: "payment done Successfully!",
                            })
                        }
                    })

            }

        })
}
exports.promoteStudentRank = async (req, res) => {
    try {
        const studentData = req.body;
        const promises = [];
        for (let resgister of studentData) {
            let registerdId = resgister.registerdId;
            let current_rank_name = resgister.current_rank_name;
            let next_rank_name = resgister.next_rank_name;
            promises.push(promoteStudents(registerdId, current_rank_name, next_rank_name))
        }
        await Promise.all(promises);
        res.json({
            success: true,
            statusCode: 200,
            msg: "Rank and Image promoted succesfully"
        })
    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }
};

async function promoteStudents(registerdId, current_rank_name, next_rank_name) {
    let registeredData = await RegisterdForTest.findById(registerdId);
    let { studentId } = registeredData;
    if (!registeredData.isDeleted) {
        const data = await program_rank.findOne({ rank_name: current_rank_name }, { _id: 0, rank_image: 1, rank_name: 1, day_to_ready: 1, programName: 1, rank_order: 1 })
        const data1 = await program_rank.findOne({ rank_name: next_rank_name }, { _id: 0, rank_image: 1 })
        let nextImage = data1 ? data1.rank_image : "no data";
        let currentImage = data ? data.rank_image : "no data";
        let rank_order = data ? data.rank_order : "no data";
        let currentprogramName = data.programName
        let currentday_to_ready = data.day_to_ready
        await RegisterdForTest.findOneAndUpdate({
            _id: registerdId
        }, {
            isDeleted: true,
            current_rank_name: current_rank_name,
            next_rank_name: next_rank_name,
            next_rank_img: nextImage,
            current_rank_img: currentImage
        });
        await Member.findByIdAndUpdate({ _id: studentId },
            { $set: { current_rank_name: current_rank_name, next_rank_name: next_rank_name, rank_order: rank_order, current_rank_img: currentImage, next_rank_name: next_rank_name, next_rank_img: nextImage, isRecommended: false } });
        studentRankInfo = await student_info_Rank.findOne({ "studentId": studentId, "programName": currentprogramName })

        if (studentRankInfo !== null) {
            await student_info_Rank.findOneAndUpdate({ studentId: studentId, programName: currentprogramName }, { rank_name: current_rank_name, day_to_ready: currentday_to_ready, rank_image: currentImage })
        } else {
            const resp = new student_info_Rank({
                programName: currentprogramName,
                rank_name: current_rank_name,
                day_to_ready: currentday_to_ready,
                rank_image: currentImage,
                studentId: studentId
            });
            await resp.save()
        }
        return true;
    }
    return false;
}

exports.removeFromRegisterd = async (req, res) => {
    let registeredId = req.params.registeredId;
    if (!registeredId) {
        res.json({
            status: false,
            msg: "Please give the registerd id in params!"
        })
    }
    let isDeleted = await RegisterdForTest.findByIdAndUpdate(registeredId, {
        "isDeleted": true
    }, {
        new: true
    });
    if (!isDeleted) {
        res.json({
            status: false,
            msg: "Unable to remove the student!!"
        })
    }
    let {
        studentId
    } = await RegisterdForTest.findById(registeredId);
    let deleteForRegistered = await Member.findOneAndUpdate({ _id: studentId }, { isRecommended: false })
    console.log(deleteForRegistered);
    if (!deleteForRegistered) {
        return res.json({
            status: false,
            msg: "Unable to remove from Registered list"
        })
    };
    let reflectedToRecommendedAgain = await RecommendedForTest.findOneAndUpdate({
        "studentId": studentId
    }, {
        "isDeleted": false
    });
    if (!reflectedToRecommendedAgain) {
        res.json({
            status: false,
            msg: "Unable to reflect into the recommeded again!!"
        })
    }
    res.json({
        status: true,
        msg: "The recommended student successfully removed from the list!!"
    })

}

exports.deleteAll = async (req, res) => {
    let registeredIds = req.body.registeredIds;
    console.log(registeredIds)
    let promise = [];
    try {
        for (let id in registeredIds) {
            await RegisterdForTest.updateOne({ _id: registeredIds[id] }, { $set: { isDeleted: true } }).then(async data => {
                let { studentId } = await RegisterdForTest.findById(registeredIds[id]);
                await Member.updateOne({ _id: studentId }, { $set: { isRecommended: false } }, function (err, datas) {
                    if (err) { res.send({ msg: "Registered Student Not Deleted!", success: false }) }
                    console.log(datas);
                    promise.push(datas);
                })
            })
        }
        Promise.all(promise);
        res.send({ msg: "Selected Students Deleted Succesfully!", success: true })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }

}

exports.multipleDocMerge = async (req, res) => {
    let registeredIds = req.body.registeredIds;
    let docBody = req.body.docBody;
    try {
        let promises = [];
        let bufCount = 0;
        for (let id in registeredIds) {
            let data = await RegisterdForTest.findOne({ _id: registeredIds[id] });
            let studentId = data.studentId;
            let resp = await Member.findOne({ _id: studentId });
            let mergedInfo = { ...data.toJSON(), ...resp.toJSON() }
            let filebuff = await mergeMultipleFiles(docBody, mergedInfo);
            bufCount = Buffer.byteLength(filebuff) + bufCount
            promises.push(filebuff);
        }
        await Promise.all(promises);
        res.send({ msg: "data!", data: promises, success: true })
        // let resultBuff = Buffer.concat(promises, bufCount)
        // let fileObj = {
        //     fieldname: 'attach',
        //     originalname: 'Test.pdf',
        //     encoding: '7bit',
        //     mimetype: 'application/pdf',
        //     buffer: resultBuff,
        //     size: bufCount
        // }
        // await (cloudUrl.imageUrl(fileObj)).then(data => {
        //     res.send({ msg: "data!", data: data, success: true })
        // })

    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.mergedDocForTest = async (req, res) => {
    let studentId = req.params.studentId;
    let recommendedId = req.params.recommendedId;
    let registeredId = req.params.testRegisteredId;
    const docBody = req.body.docBody;
    //console.log(req.socket.remoteAddress);
    //console.log(req.ip);
    try {
        if (studentId && registeredId) {
            await Member.findOne({ _id: studentId }).then(async data => {
                let studentData = data
                await RegisterdForTest.findOne({ _id: registeredId }).then(async resp => {
                    let mergedInfo = { ...studentData.toJSON(), ...resp.toJSON() }
                    let fileObj = await mergeFile(docBody, mergedInfo);
                    await cloudUrl.imageUrl(fileObj).then(data => {
                        res.send({ success: true, data: data })
                    }).catch(err => {
                        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
                    })
                }).catch(err => {
                    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
                })
            }).catch(err => {
                res.send({ msg: err.message.replace(/\"/g, ""), success: false })
            })
        } else if (studentId && recommendedId) {
            await Member.findOne({ _id: studentId }).then(async data => {
                let studentData = data
                await RecommendedForTest.findOne({ _id: recommendedId }).then(async resp => {
                    let mergedInfo = { ...studentData.toJSON(), ...resp.toJSON() }
                    let fileObj = await mergeFile(docBody, mergedInfo);
                    await cloudUrl.imageUrl(fileObj).then(data => {
                        res.send({ success: true, data: data })
                    }).catch(err => {
                        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
                    })
                }).catch(err => {
                    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
                })
            }).catch(err => {
                res.send({ msg: err.message.replace(/\"/g, ""), success: false })
            })
        } else {
            await Member.findOne({ _id: studentId }).then(async data => {
                let mergedInfo = { ...data.toJSON() }
                let fileObj = await mergeFile(docBody, mergedInfo);
                await cloudUrl.imageUrl(fileObj).then(data => {
                    res.send({ success: true, data: data })
                }).catch(err => {
                    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
                })
            }).catch(err => {
                res.send({ msg: err.message.replace(/\"/g, ""), success: false })
            })
        }
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}



// let studentId = req.params.studentId;
//     const docBody = req.body.docBody;
//     try {
//         let studentData = await Member.findOne({ _id: studentId });
//         let testData = await RegisterdForTest.findOne({ studentId: studentId });
//         let mergedInfo = { ...studentData.toJSON(), ...testData.toJSON() };
//         console.log(mergedInfo);
//         let fileObj = await mergeFile(docBody, mergedInfo);
//         await cloudUrl.imageUrl(fileObj).then(data => {
//             res.send({ success: true, data: data })
//         }).catch(err => {
//             res.send({ msg: err.message.replace(/\"/g, ""), success: false })
//         })
//     } catch (err) {
//         res.send({ msg: err.message.replace(/\"/g, ""), success: false })
//     }