require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedCandidateModel = require('../models/recommendedCandidate');
const Stripe = require('../models/candidate_stripe');
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
        phone: Joi.string().allow(null).allow(''),
        program: Joi.string().required(),
        rating: Joi.number().required(),
        isRecomCandidate:Joi.boolean(),
        candidate: Joi.string().allow(null).allow(''),
        current_stripe: Joi.string().allow(null).allow(''),
        current_rank_name: Joi.string().allow(null).allow(''),
        current_rank_name: Joi.string().allow(null).allow(''),
        userId: Joi.string().required(),
        next_rank_name: Joi.string().allow(null).allow(''),
        current_rank_img: Joi.string().allow(null).allow(''),
        next_rank_img: Joi.string().allow(null).allow(''),
        memberprofileImage: Joi.string().allow(null).allow(''),
    })
    try {
        if (!students.length) {
            return res.json({
                status: students,
                msg: "You haven't selected any student!"
            })
        }
        const recommendedCandidates = [];
        var alredyRecomend = "";
        const promises = [];

        for (let student of students) {
            if (!student.isRecomCandidate && student.program) {
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
                msg: `${alredyRecomend} already on the recommended list!`
            })
        }


        res.json({
            status: true,
            msg: "Selected students got recommended successfully!",
            data: recommendedCandidates
        })


    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }
}


const updateStudentsById = async (studentId, candidate) => {
    return Member.findByIdAndUpdate({ _id: studentId }, { candidate: candidate, isRecomCandidate: true })
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

        const {
            join,
            quite,
            programmName,
            reason
        } = req.body;

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
        if (join) {
            let joinedHistory = {
                join,
                candidate,
                "statusUpdateDate": date
            }
            let JoinedStatus = await RecommendedCandidateModel.updateOne({
                "_id": recommededCandidateId
            }, {
                $set: joinedHistory,
                $push: {
                    joinHistory: joinedHistory
                },
                new: true

            })
        } else if (quite) {
            let joinedHistory = {
                quite,
                candidate,
                reason,
                "statusUpdateDate": date
            }
            let JoinedStatus = await RecommendedCandidateModel.updateOne({
                "_id": recommededCandidateId
            }, {
                $set: joinedHistory,
                $push: {
                    joinHistory: joinedHistory
                },
                new: true

            })
        }

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

exports.getFilteredStudents = async (req, res) => {
    let userId = req.params.userId;
    let startDate = req.params.dates;
    let newMonth = parseInt(startDate.slice(0, 2));
    let newYear = parseInt(startDate.slice(-4));
    try {
        data = await RecommendedCandidateModel.aggregate(
            [
                {
                    $match:

                        { userId: userId }
                },
                {
                    $project: {
                        lastPromotedDate: "$lastPromotedDate",
                        candidate_status: "$candidate_status",
                        last_stripe_given: "$last_stripe_given",
                        current_stripe: "$current_stripe",
                        stripe_history: "$stripe_history",
                        joinHistory: "$joinHistory",
                        isDeleted: "$isDeleted",
                        studentId: "$studentId",
                        rating: "$rating",
                        firstName: "$firstName",
                        lastName: "$lastName",
                        memberprofileImage: "$memberprofileImage",
                        userId: "$userId",
                        program: "$program",
                        current_rank_name: "$current_rank_name",
                        next_rank_name: "$next_rank_name",
                        candidate: "$candidate",
                        current_rank_img: "$current_rank_img",
                        month: { $month: "$createdAt" },
                        year: {
                            $year: "$createdAt",
                        }
                    }
                },
                {

                    $match: { month: newMonth, year: newYear },

                }

            ]
        );
        if (data.length > 0) {
            return res.send({ data: data, success: true, msg: "data!" })
        }
        return res.send({ data: data, success: true, msg: "No data for This filter!" })
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.searchRecommendedStudentByName = async (req, res) => {
    const search = req.query.search;
    try {
        const data = await RecommendedCandidateModel.find({
            $or: [
                { lastName: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } }
            ]
        });
        res.send({ data: data, success: true })

    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false })
    }
}

exports.getRecommendedCandidateStudents = async (req, res) => {
    try {

        let userId = req.params.userId;
        let sortBy = req.query.sortBy || "firstName"
        let order = req.query.order || 1
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

        let students = await RecommendedCandidateModel
            .find({ "userId": userId, "isDeleted": false })
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({ [sortBy]: order });
        if (!students.length) {
            return res.json({ success: false, msg: "There no data available for this query!!" })
        }
        res.json({ success: true, data: students, totalCount: totalCount })
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
            await Member.updateOne({ _id: studentId }, { $set: { isRecomCandidate: false } })
                .then(async resp => {
                    await RecommendedCandidateModel.findByIdAndDelete(recommendIds[id], function (err, data) {
                        if (err) { res.send({ msg: "Recommended Candidate Student Not Deleted!", success: false }) }
                        promise.push(data)
                    })
                })
                .catch(err => {
                    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
                })
        }
        Promise.all(promise);
        res.send({ msg: "Selected Students Deleted Succesfully!", success: true })
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
    }
}


exports.recomendData = async (req, res) => {
    let userId = req.params.userId;
    try {
        let data = await RecommendedCandidateModel.aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $project: {
                    candidate: 1,
                    last_stripe_given: 1,
                    rating: 1,
                    candidate_status: 1,
                    firstName: 1,
                    lastName: 1
                }
            }
        ])
        return res.send({
            success: true,
            msg: "data!",
            data: data
        })

    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }


}

exports.dashboardCandidateInfo = async (req, res) => {
    let userId = req.params.userId;
    let candidate = req.params.candidate;
    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    try {
        let data = await RecommendedCandidateModel.aggregate([
            {
                $match: {
                    userId: userId,
                    candidate: candidate
                }
            },
            {
                $project: {
                    _id: 0,
                    candidate:1,
                    firstName: 1,
                    lastName: 1,
                    current_rank_name: 1,
                    last_stripe_given: 1,
                    studentId: 1,
                }
            },
            { $addFields: { "studentId": { "$toObjectId": "$studentId" } } },
            {
                $lookup:
                {
                    from: "members",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "statusInfo",
                }
            },
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    candidate:1,
                    current_rank_name: 1,
                    last_stripe_given: 1,
                    status: { $arrayElemAt: ["$statusInfo.status", 0] },
                }
            },
            {
                $facet: {
                  paginatedResults: [
                    { $skip: pagination.skip },
                    { $limit: pagination.limit },
                  ],
                  totalCount: [
                    {
                      $count: "count",
                    },
                  ],
                },
              },
        ])
        let result = data[0].paginatedResults
        return res.send({
            data: result,
            msg: "Data!",
            totalCount: data[0].totalCount[0].count,
            success: true
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
        let deleteRecommended = await Member.findOneAndUpdate({ _id: studentId }, { isRecomCandidate: false })
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