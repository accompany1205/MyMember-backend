require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedForTest = require('../models/recommendedForTest');
const RegisterdForTest = require('../models/registerdForTest');
const ProgramRankModel = require('../models/program_rank');
const Program = require('../models/program');
const { forEach } = require('lodash');



exports.promoteStudentRank = async (req, res) => {
    try {
        let registeredId = req.params.registeredId;
        if (!registeredId) {
            res.json({
                statusCode: 404,
                success: false,
                msg: 'please provide valid registered student Id',
            });
        }
        let current_rank = req.body.current_rank;
        let next_rank = req.body.next_rank;
        let registeredData = await RegisterdForTest.findById(registeredId);
        let { studentId } = registeredData;
        if (!registeredData.isDeleted) {
            let studentInfo = await Member.findById(studentId);
            let { program } = studentInfo;
            let programInfo = await Program.findOne({ programName: program }, { program_rank: 1 })
            let newCurrentImg;
            let newNextImg;
            programInfo.program_rank.forEach(async element => {
                let programRankInfo = await ProgramRankModel.findById(element);
                if (current_rank === programRankInfo.rank_name) {
                    newCurrentImg = await programRankInfo.rank_image;
                    await Member.findByIdAndUpdate({ _id: studentId },
                        { $set: { current_rank_img: newCurrentImg, current_rank_name: current_rank } })
                }
                if (next_rank === programRankInfo.rank_name) {
                    newNextImg = await programRankInfo.rank_image;
                    await Member.findByIdAndUpdate({ _id: studentId },
                        { $set: { next_rank_img: newNextImg, next_rank_name: next_rank } })
                    await RegisterdForTest.findOneAndUpdate({
                        "studentId": studentId
                    }, {
                        "isDeleted": true,
                        "current_rank": current_rank,
                        "next_rank": next_rank
                    });
                    await RecommendedForTest.findOneAndUpdate({"studentId":studentId}, {
                        "current_rank":current_rank, "next_rank":next_rank
                    });
                    if (newNextImg === null) {
                        res.json({
                            success: false,
                            statusCode: 200,
                            msg: "no next rank matched"
                        })
                    }else {
                        res.json({
                            success: true,
                            statusCode: 200,
                            msg: "Rank and Image promoted succesfully"
                        })
                    }
                   
                }
            });
            console.log("jhj",newCurrentImg)
        }
        else {
            res.json({
                success: false,
                statusCode: 200,
                msg: "User is not in registered list"
            })
        }

        // let current_rank = req.body.current_rank
        // let next_rank = req.body.next_rank
        // let registeredId = req.params.registeredId;
        // let rankUpdate = await RegisterdForTest.findById(registeredId);
        // let {
        //     studentId
        // } = rankUpdate;
        // if (!rankUpdate.isDeleted) {
        //     let removedFromRegister = await RegisterdForTest.findOneAndUpdate({
        //         "studentId": studentId
        //     }, {
        //         "isDeleted": true,
        //         "current_rank": current_rank,
        //         "next_rank": next_rank
        //     });
        //     let studentInfo = await Member.findById(studentId);
        //     let { programId } = studentInfo;
        //     let programInfo = await Program.findById(programId);
        //     let {
        //         program_rank
        //     } = programInfo;
        //     if (!program_rank) {
        //         res.json({
        //             statusCode: 200,
        //             success: true,
        //             msg: "No rank found in program-rank"
        //         })
        //     };
        //     //let rankImg = 
        //     let memberRankUpdate = await Member.findByIdAndUpdate({ _id: studentId }, { $set: { rankFromRecomendedTest: current_rank, next_rank } })
        //     //console.log(memberRankUpdate)
        //     if (!removedFromRegister) {
        //         res.json({
        //             status: false,
        //             msg: "Having issue while removing form recommeded list!!"
        //         })
        //     }
        // }
        // else {
        //     res.json({
        //         success: false,
        //         statusCode: 200,
        //         msg: "User is not in registered list"
        //     })
        // }
        // res.json({
        //     statusCode: 200,
        //     success: true,
        //     msg: "promoted and Rank updated succesFully"
        // })
    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }

};





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