require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedForTest = require('../models/recommendedForTest');
const RegisterdForTest = require('../models/registerdForTest');
const ProgramRankModel = require('../models/program_rank');


//TODO - Pavan - Please create logic to find out the next rank.
exports.promoteStudentRank = async (req, res) => {
    try {
        let current_rank = req.body.current_rank
        let next_rank = req.body.next_rank
        let registeredId = req.params.registeredId;
        let rankUpdate = await RegisterdForTest.findById(registeredId);
        let {
            studentId
        } = rankUpdate;
        // let isStudentRegisterd = await RegisterdForTest.findOne({
        //     "studentId": studentId
        // })
        if (!rankUpdate.isDeleted) {
            let removedFromRegister = await RegisterdForTest.findOneAndUpdate({
                "studentId": studentId
            }, {
                "isDeleted": true,
                "current_rank": current_rank, 
                "next_rank": next_rank
            });
            let memberRankUpdate = await Member.findByIdAndUpdate({ _id: studentId }, { $set: {rankFromRecomendedTest: current_rank, next_rank } })
            console.log(memberRankUpdate)
            if (!removedFromRegister) {
                res.json({
                    status: false,
                    msg: "Having issue while removing form recommeded list!!"
                })
            }
        }
        else{
            res.json({
                success: false,
                statusCode:200,
                msg: "User is not in registered list"
            })
        }
        res.json({
            statusCode:200,
            success: true,
            msg:"promoted and Rank updated succesFully"
        })
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