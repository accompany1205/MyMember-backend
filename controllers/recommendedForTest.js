require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedForTest = require('../models/recommendedForTest');
const RegisterdForTest = require('../models/registerdForTest');
const program_rank = require("../models/program_rank");
const Joi = require('@hapi/joi');



exports.getRecommededForTest = async (req, res) => {
    let userId = req.params.userId;
    if (!userId) {
        res.json({
            status: false,
            msg: "Please give userId into the params!!"
        })
    }

    let students = await RecommendedForTest.find({
        "userId": userId,
        "isDeleted": false
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

exports.getRegisteredForTest = async (req, res) => {
    let userId = req.params.userId;
    if (!userId) {
        res.json({
            status: false,
            msg: "Please give userId into the params!!"
        })
    }

    let students = await RegisterdForTest.find({
        "isDeleted": false
    });
    if (!students.length) {
        res.json({
            status: false,
            msg: "There no data available for this query!!",
            data: students
        })
    }
    res.json({
        status: true,
        msg: "Please find the data!!",
        data: students
    })

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
        current_rank: Joi.string(),
        userId: Joi.string().required(),
        next_rank: Joi.string(),
        current_rank_image: Joi.string(),
        next_rank_image: Joi.string().default("1"),
        lastPromotedDate: Joi.string().required(),
        isRecommended: Joi.boolean().required()
    })

    try {
        if (!students) {
            res.json({
                status: false,
                msg: "You haven't selected any student!"
            })
        }
        const data = await program_rank.findOne({ rank_name: students.current_rank }, { _id: 0, rank_image: 1 })
        const data1 = await program_rank.findOne({ rank_name: students.next_rank }, { _id: 0, rank_image: 1 })
        const recommendedStudentsForTest = [];
        var alredyRecomend = "";
        const promises = [];
        for (let student of students) {
            if (!student.isRecommended && student.program) {
                student.userId = userId;
                if (data !== null) {
                    student.current_rank_image = data.rank_image;
                } else {
                    student.current_rank_image = "no data"
                }
                if (data1 !== null) {
                    student.next_rank_image = data1.rank_image;
                } else {
                    student.next_rank_image = "no data"
                }
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
                msg: `${alredyRecomend}, these students are alredy in recommended list`
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
    let {
        testId,
        studentId,
        rating,
        current_rank,
        next_rank,
        current_rank_image,
        next_rank_image,
        method,
        phone,
        firstName,
        lastName,
        memberprofileImage,
        program
    } = req.body;
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
    let registerd = await RegisterdForTest.create({
        "studentId": studentId,
        "firstName": firstName,
        "testId": testId,
        "lastName": lastName,
        "rating": rating,
        "current_rank": current_rank,
        "next_rank": next_rank,
        "userId": userId,
        "current_rank_image": current_rank_image,
        "method": method,
        "memberprofileImage": memberprofileImage,
        "next_rank_image": next_rank_image,
        "phone": phone,
        "program": program
    });
    if (registerd === null) {
        res.json({
            status: false,
            msg: "Having some issue while register!!!!!!!"
        })
    }
    let date = new Date();
    let history = {
        "current_rank": current_rank,
        "program": program,
        "current_rank_image": current_rank_image,
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
        res.json({
            status: false,
            msg: "Having some issue while register!!"
        })
    }
    let removedFromRecommended = await RecommendedForTest.updateMany({
        "studentId": studentId
    }, {
        "isDeleted": true
    }, {
        new: true
    });
    console.log("removed", removedFromRecommended)
    if (!removedFromRecommended) {
        res.json({
            status: false,
            msg: "Having issue while removing form recommeded list!!"
        })
    }

    res.json({
        status: true,
        msg: "Student successfully promoted to registerd list!!",
        data: registerd
    })
    //}
}



exports.removeFromRecomended = async (req, res) => {
    let recommededId = req.params.recommendedId;
    if (!recommededId) {
        res.json({
            status: false,
            msg: "Please give the recomended id in params!"
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