require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedForTest = require('../models/recommendedForTest');
const RegisterdForTest = require('../models/registerdForTest');
const ProgramRankModel = require('../models/program_rank');


//TODO - Pavan - Please create logic to find out the next rank.
exports.promoteStudentRank = async (req, res) => {
    let registeredId = req.params.registeredId;

    let registeredStudent = await RegisterdForTest.findById(registeredId);
    let {
        programName,
        current_rank_name,
        next_rank_name
    } = registeredStudent;

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