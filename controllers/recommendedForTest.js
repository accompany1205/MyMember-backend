require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedForTest = require('../models/recommendedForTest');
const RegisterdForTest = require('../models/registerdForTest')


exports.getRecommededForTest = async (req, res) => {
    let userId = req.params.userId;
    if (!userId) {
        res.json({
            status: false,
            msg: "Please give userId into the params!!"
        })
    }

    let students = await RecommendedForTest.find({
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


exports.recomendStudent = async (req, res) => {
    //only accepte array of objects
    let students = req.body;
    if (!students) {
        res.json({
            status: false,
            msg: "You haven't selected any student!"
        })
    }
    const recommendedStudentsForTest = [];
    for (let student of students) {
        let {
            _id: studentId,
            firstName,
            lastName,
            rating,
            current_rank_name,
            next_rank_name,
            userId
        } = student;
        let isStudentExists = await RecommendedForTest.find({
            "studentId": studentId
        });
        if (!isStudentExists.length) {
            recommendedStudentsForTest.push({
                "studentId": studentId,
                "firstName": firstName,
                "lastName": lastName,
                "rating": rating,
                "current_rank_name": current_rank_name,
                "next_rank_name": next_rank_name,
                "userId": userId
            })
        }
    }

    let recommended = await RecommendedForTest.insertMany(recommendedStudentsForTest);
    if (!recommended.length) {
        res.json({
            status: false,
            msg: "Having some issue while createing the recommended list!!"
        })
    } else {
        res.json({
            status: true,
            msg: "Selected students got recomended successfully.",
            data: recommended
        })
    }

};


exports.payAndPromoteTheStudent = async (req, res) => {
    let {
        testId,
        studentId,
        firstName,
        lastName,
        rating,
        current_rank,
        next_rank,
        userId
    } = req.body;

    //If student removed by mistake and adding again to the registerd list...
    let isStudentRegisterd = await RegisterdForTest.findOne({
        "studentId": studentId
    })
    if (isStudentRegisterd) {
        let removedFromRecommended = await RecommendedForTest.findOneAndUpdate({
            "studentId": studentId
        }, {
            "isDeleted": false
        });
        if (!removedFromRecommended) {
            res.json({
                status: false,
                msg: "Having issue while removing form recommeded list!!"
            })
        }

        let updateIsDeleted = await RegisterdForTest.findOneAndUpdate({
            "studentId": studentId
        }, {
            "isDeleted": false
        }, {
            new: true
        });
        if (!updateIsDeleted) {
            res.json({
                status: false,
                msg: "Unable to reflect into the registerd again!!"
            })
        }
        res.json({
            status: true,
            msg: "Student successfully promoted to registerd list!!",
            data: updateIsDeleted
        })

    } else {
        //If moving the student to the registerd list for the fist time.
        let registerd = await RegisterdForTest.create({
            "studentId": studentId,
            "firstName": firstName,
            "lastName": lastName,
            "rating": rating,
            "current_rank": current_rank,
            "next_rank": next_rank,
            "userId": userId
        });
        if (!registerd) {
            res.json({
                status: false,
                msg: "Having some issue while register!!"
            })
        }
        let updatedTestPurchasing = await Member.findByIdAndUpdate(studentId, {
            $push: {
                test_purchasing: testId
            }
        }, {
            new: true
        })
        if (!updatedTestPurchasing) {
            res.json({
                status: false,
                msg: "Having some issue while register!!"
            })
        }
        let removedFromRecommended = await RecommendedForTest.findOneAndUpdate({
            "studentId": studentId
        }, {
            "isDeleted": true
        }, {
            new: true
        });

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
    }
}

exports.removeFromRecomended = async (req, res) => {
    let recommededId = req.params.recommendedId;
    if (!recommededId) {
        res.json({
            status: false,
            msg: "Please give the recomended id in params!"
        })
    }
    let isDeleted = await RecommendedList.findByIdAndDelete(recommededId);
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