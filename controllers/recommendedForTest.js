require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedForTest = require('../models/recommendedForTest');
const RegisterdForTest = require('../models/registerdForTest');
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
    //only accepte array of objects

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
        current_rank_name: Joi.string(),
        next_rank_name: Joi.string(),

    })

    try {

        if (!students) {
            res.json({
                status: false,
                msg: "You haven't selected any student!"
            })
        }

        const recommendedStudentsForTest = [];
        for (let student of students) {
            student.userId = userId
            await recommendedFortestSchema.validateAsync(student);
            recommendedStudentsForTest.push(student)

            // let isStudentExists = await RecommendedForTest.find({
            //     "studentId": student.studentId
            // });
            // console.log(isStudentExists)
            // if (isStudentExists.length > 0) {
            //     recommendedStudentsForTest.push(student)
            // }
        }
        await RecommendedForTest.insertMany(recommendedStudentsForTest);
        res.send({
            success: true,
            msg: "Selected students got recomended successfully.",
        })
        // try{
        //     await RecommendedForTest.insertMany(recommendedStudentsForTest);
        //     res.send({
        //         success: true,
        //         msg: "Selected students got recomended successfully.",
        //     })
        // }catch(eror){
        //     res.send({ error: error.message.replace(/\"/g, ""), success: false })
        // }

    } catch (error) {
        let errorFound = error.message.replace(/\"/g, "")
        if (errorFound.includes('duplicate key')) {
            res.send({ error: 'Student already exist in recommend list !', success: false })
        }
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }


};


exports.payAndPromoteTheStudent = async (req, res) => {
    let userId = req.params.userId;
    let {
        testId,
        studentId,
        rating,
        current_rank,
        next_rank,
        current_rank_img,
        method,
        phone
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
            "isDeleted": false,
            "userId": userId
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
        let studentData = await Member.findById(studentId)
        console.log(studentData)
        let registerd = await RegisterdForTest.create({
            "studentId": studentId,
            "firstName": studentData.firstName,
            "testId": testId,
            "lastName": studentData.lastName,
            "rating": rating,
            "current_rank": current_rank,
            "next_rank": next_rank,
            "userId": userId,
            "current_rank_img": current_rank_img,
            "method": method,
            "memberprofileImage": studentData.memberprofileImage,
            "phone": phone,
            "program": studentData.program
        });
        console.log(registerd)
        if (!registerd) {
            res.json({
                status: false,
                msg: "Having some issue while register!!"
            })
        }
        let date = new Date();
        let history = {
            "current_rank": current_rank,
            "program": studentData.program,
            "current_rank_img": current_rank_img,
            "testPaid": date,
            "promoted": date
        }
        let updatedTestPurchasing = await Member.findByIdAndUpdate(studentId, {
            $push: {
                test_purchasing: testId,
                rank_update_test_history: history
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