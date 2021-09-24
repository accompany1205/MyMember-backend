require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedCandidateModel = require('../models/recommendedCandidate');
const RegisterdForTest = require('../models/registerdForTest');
const ProgramModel = require('../models/program');


/**This api belongs to studend_program_rank_history;
 * 
 * @param {*} req
 * @param {*} res 
 */

exports.recomendStudent = async (req, res) => {
    //only accepte array of objects
    let students = req.body;
    if (!students) {
        res.json({
            status: false,
            msg: "You haven't selected any student!"
        })
    }
    const recommendedCandidates = [];
    for (let student of students) {
        let {
            _id: studentId,
            status,
            firstName,
            lastName,
            memberprofileImage,
            current_rank_id,
            current_rank_name,
            current_rank_img,
            current_stripe,
            userId,
            program,
            programID
        } = student;
        let isStudentExists = await RecommendedCandidateModel.find({
            "studentId": studentId
        });
        if (!isStudentExists.length && status == "Active") {
            recommendedCandidates.push({
                "fullName": `${firstName} ${lastName}`,
                "memberprofileImage": memberprofileImage,
                "studentId": studentId,
                "userId": userId,
                "programId": programID,
                "programName": program,
                "current_stripe": current_stripe,
                "current_rank_id": current_rank_id,
                "current_rank_name": current_rank_name,
                "current_rank_img": current_rank_img
            })
        }
    }
    let recommended = await RecommendedCandidateModel.insertMany(recommendedCandidates);
    if (!recommended.length) {
        res.json({
            statusCode:422,
            status: false,
            msg: "Ether the student is areadey in recommeded list or it is not eligible!!"
        })
    } else {
        res.json({
            status: true,
            msg: "Selected students got recomended successfully.",
            data: recommended,
            statusCode:200,
        })
    }

};


exports.promoteTheStudentStripe = async (req, res) => {
    let recommededCandidateId = req.params.recommededCandidateId;
    if (!recommededCandidateId) {
        return res.json({
            status: false,
            msg: "Please give recommededCandidateId in the params!!"
        })
    }
    let recommendedStudent = await RecommendedCandidateModel.findById(recommededCandidateId);
    if (!recommendedStudent) {
        return res.json({
            status: false,
            msg: "There is no any studend available with this id!!"
        })
    }
    let {
        programId,
        programName,
        studentId,
        current_stripe
    } = recommendedStudent;
    let programDetails = await ProgramModel.findById(programId)
    if (!programDetails) {
        return res.json({
            status: false,
            msg: "There is some issue while fetching data of program!!"
        })
    }
    let {
        total_rank
    } = programDetails;

    if (!(current_stripe < total_rank)) {
        return res.json({
            status: true,
            msg: "The meximum limit has been reached!"
        })
    }

    let updateStripeIntoRecommededCandidate = await RecommendedCandidateModel.findOneAndUpdate({
        "_id": recommededCandidateId
    }, {
        "current_stripe": current_stripe + 1,
        "lastStripeUpdatedDate": new Date()
    }, {
        new: true
    })
    if (!updateStripeIntoRecommededCandidate) {
        res.json({
            status: false,
            msg: "Having some issue while updating student with new stripe!!"
        })
    }
    let {
        current_rank_name,
        recommededDate,
        lastStripeUpdatedDate
    } = updateStripeIntoRecommededCandidate

    let history = {
        "programName": programName,
        "current_rank_name": current_rank_name,
        "current_stripe": current_stripe + 1,
        "recommededDate": recommededDate,
        "lastStripeUpdatedDate": lastStripeUpdatedDate
    }
    let updateStripeIntoStudent = await Member.findOneAndUpdate({
        "_id": studentId
    }, {
        "current_stripe": current_stripe + 1,
        $push: {
            rank_update_history: history
        }
    }, {
        new: true
    })
    return res.json({
        status: true,
        msg: "The stripe got updated successfully!",
        data: updateStripeIntoStudent
    })

    //Todo - Monu - Please write a logic with the stripe and programs.




}

exports.getRecommendedCandidateStudents = async (req, res) => {
    let userId = req.params.userId;
    if (!userId) {
        res.json({
            status: false,
            msg: "Please give userId into the params!!"
        })
    }

    let students = await RecommendedCandidateModel.find({
        "userId": userId
    });
    if (!students.length) {
        res.json({
            status: false,
            msg: "There no data available for this query!!"
        })
    }
    res.json({
        status: true,
        msg: "Please find the data!!",
        data: students
    })


}

exports.removeFromRecomended = async (req, res) => {
    let recommededId = req.params.recommededCandidateId;
    if (!recommededId) {
        res.json({
            status: false,
            msg: "Please give the recomended id in params!"
        })
    }
    let isDeleted = await RecommendedCandidateModel.findByIdAndDelete(recommededId);
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