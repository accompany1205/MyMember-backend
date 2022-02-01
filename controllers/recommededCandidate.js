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
                let candidate = student.candidate
                promises.push(updateStudentsById(studentId, candidate))
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


const updateStudentsById = async (studentId, candidate) => {
    return Member.findByIdAndUpdate({ _id: studentId }, { candidate: candidate, isRecommended: true })
}

exports.promoteTheStudentStripe = async (req, res) => {
    try {
        if (_.isEmpty(req.body)) {
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
            $set: {
                candidate: candidate,
                current_stripe: current_stripe
            },
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
        let sortBy = req.query.sortBy || "firstName"
        let order = req.query.order || 1
        let userId = req.params.userId;
        var totalCount = await RecommendedCandidateModel
        .find({
            "userId": userId,
            "isDeleted": false
        })
        .countDocuments();
        var per_page = parseInt(req.params.per_page) || 10;
        var page_no = parseInt(req.params.page_no) || 0;
        var pagination = {
            limit: per_page,
            skip: per_page * page_no,
        };
        if (!userId) {
            res.json({
                success: false, msg: "Please give userId into the params!!"
            })
        }
        
        let students = await RecommendedCandidateModel.find({ "userId": userId,"isDeleted": false })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ [sortBy]: order });
        if (!students.length) {
            return res.json({ success: false, msg: "There no data available for this query!!" })
        }
        res.json({ success: true, data: students, totalCount:totalCount })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }



}

exports.removeAll = async (req, res) => {
    let recommendIds = req.body.recommendIds;
    let promise = [];
    try {
        for (let id in recommendIds) {
            let { studentId } = RecommendedCandidateModel.findById(recommendIds[id]);
            await Member.updateOne({ _id: studentId }, { $set: { isRecomCandidate: false } }).then(async resp => {
                await RecommendedCandidateModel.findByIdAndDelete(recommendIds[id], function (err, data) {
                    if (err) { res.send({ msg: "Recommended Candidate Student Not Deleted!", success: false }) }
                    promise.push(data)
                })
            }).catch(err => {
                res.send({ msg: err.message.replace(/\"/g, ""), success: false })
            })
        }
        Promise.all(promise);
        res.send({ msg: "Selected Students Deleted Succesfully!", success: true })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
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