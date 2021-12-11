require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedCandidateModel = require('../models/recommendedCandidate');
const Stripe = require('../models/stripe');
// const Stripe = require('../models/stripe');
const Joi = require('@hapi/joi');
const _ = require('lodash')

/**This api belongs to studend_program_rank_history;
 * 
 * @param {*} req
 * @param {*} res 
 */

exports.recomendStudent = async (req, res) => {
    //only accepte array of objects
    let students = req.body;
    let userId = req.params.userId;
    let recommendedForcandidateSchema = Joi.object({
        studentId: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        status: Joi.string().required(),
        memberprofileImage: Joi.string(),
        phone: Joi.string(),
        program: Joi.string().required(),
        rating: Joi.number().required(),
        candidate: Joi.string(),
        current_stripe: Joi.string(),
        current_rank_name: Joi.string(),
        current_rank_name: Joi.string(),
        userId: Joi.string().required(),
        next_rank_name: Joi.string(),
        current_rank_img: Joi.string(),
        next_rank_img: Joi.string(),
        isRecommended: Joi.boolean().required()
    })
    try {
        if (!students.length) {
            res.json({
                status: students,
                msg: "You haven't selected any student!"
            })
        }
        const recommendedCandidates = [];
        var alredyRecomend = "";
        const promises = [];

        for (let student of students) {
            if (!student.isRecommended && student.program) {
                student.userId = userId;
                await recommendedForcandidateSchema.validateAsync(student);
                recommendedCandidates.push(student)
                let studentId = student.studentId
                promises.push(updateStudentsById(studentId))
            } else {
                alredyRecomend += `${student.firstName} ${student.lastName}, `
            }
        }
        await Promise.all(promises);
        await RecommendedCandidateModel.insertMany(recommendedCandidates);

        if (alredyRecomend) {
            return res.send({
                recommendedCandidates,
                success: false,
                msg: `${alredyRecomend},  either these students are alredy in Candidate list or program is not selected`
            })
        }


        res.json({
            status: true,
            msg: "Selected students got recomended successfully.",
            data: recommendedCandidates
        })


    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }
}


const updateStudentsById = async (studentId) => {
    return Member.findByIdAndUpdate({ _id: studentId }, { isRecommended: true })
}

exports.promoteTheStudentStripe = async (req, res) => {
    try {
        if (_.isEmpty(req.body)) {
            console.log(req.body)

            return res.json({
                success: false,
                msg: "invalid input"
            })
        }
        let recommededCandidateId = req.params.recommededCandidateId;
        if (!recommededCandidateId.length) {
            return res.json({
                success: false,
                msg: "Please give recommededCandidateId in the params!!"
            })
        }

        let recommendedStudent = await RecommendedCandidateModel.findById(recommededCandidateId);
        if (!recommendedStudent) {
            return res.json({
                success: false,
                msg: "There is no any studend available with this id!!"
            })
        }
        let date = new Date();
        const {
            studentId,
            candidate,
            current_stripe,
        } = req.body;
        // let stripeDetails = await Stripe.find({ candidate: candidate, stripe_name: current_stripe })
        // if (!stripeDetails) {
        //     return res.json({
        //         success: false,
        //         msg: "There is some issue while fetching Stripe!!"
        //     })
        // }
        let history = {
            current_stripe,
            candidate,
            "last_stripe_given": date
        }
        // if (!(current_stripe < total_stripe)) {
        //     return res.json({
        //         success: true,
        //         msg: "The meximum stripe limit has been reached!"
        //     })
        // }
        let updateStripeIntoRecommededCandidate = await RecommendedCandidateModel.updateOne({
            "_id": recommededCandidateId
        }, {
            $set: history,
            $push: {
                stripe_history: history
            },
            new: true

        })
        if (!updateStripeIntoRecommededCandidate) {
            res.json({
                success: updateStripeIntoRecommededCandidate,
                msg: "Having some issue while updating student with new stripe!!"
            })
        }


        let updateStripeIntoStudent = await Member.findByIdAndUpdate(
            studentId, {
            $push: {
                rank_update_history: history
            }
        }, {
            new: true
        })
        return res.json({
            success: true,
            msg: "The stripe got updated successfully!",
            data: updateStripeIntoStudent
        })

        //Todo - Monu - Please write a logic with the stripe and programs.
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

exports.getRecommendedCandidateStudents = async (req, res) => {
    try {
        let userId = req.params.userId;
        if (!userId) {
            res.json({
                success: false,
                msg: "Please give userId into the params!!"
            })
        }

        let students = await RecommendedCandidateModel.find({
            "userId": userId
        });
        if (!students.length) {
            res.json({
                success: false,
                msg: "There no data available for this query!!"
            })
        }
        res.json({
            success: true,
            msg: "Please find the data!!",
            data: students
        })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }



}

exports.removeFromRecomended = async (req, res) => {
    try {
        let recommededId = req.params.recommededCandidateId;
        if (!recommededId.length) {
            return res.json({
                success: false,
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
        let isDeleted = await RecommendedCandidateModel.findByIdAndDelete(recommededId);
        if (!isDeleted) {
            res.json({
                success: false,
                msg: "Unable to remove the student!!"
            })
        } else {
            res.json({
                success: true,
                msg: "The recommeded student successfully removed from the list!!"
            })

        }
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }
}