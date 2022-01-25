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
        const data = await program_rank.findOne({ rank_name: current_rank_name }, { _id: 0, rank_image: 1, rank_name: 1, day_to_ready: 1, programName: 1 })
        const data1 = await program_rank.findOne({ rank_name: next_rank_name }, { _id: 0, rank_image: 1 })
        let nextImage = data1 ? data1.rank_image : "no data";
        let currentImage = data ? data.rank_image : "no data";
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
            { $set: { current_rank_name: current_rank_name, next_rank_name: next_rank_name, current_rank_img: currentImage, next_rank_name: next_rank_name, next_rank_img: nextImage, isRecommended: false } });
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
    let deleteForRegistered = await Member.findOneAndUpdate(studentId, { isRecommended: false })
    if (!deleteForRegistered) {
        res.json({
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
        msg: "The recommeded student successfully removed from the list!!"
    })

}

exports.mergedDocForTest = async (req, res) => {
    let studentId = req.params.studentId;
    const docBody = req.body.docBody;
    console.log(req.socket.remoteAddress);
    console.log(req.ip);
    try {
        await Member.findOne({ _id: studentId }).then(async data => {
            let studentData = data
            await RegisterdForTest.findOne({ studentId: studentId }).then(async resp => {
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