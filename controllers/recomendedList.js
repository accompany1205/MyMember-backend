require('dotenv').config();
const User = require('../models/user');
const Member = require('../models/addmember');
const RecommendedList = require('../models/recommendedList');



exports.recomendStudent = async (req, res) => {
    //only accepte array of objects
    let students = req.body;
    if (!students) {
        res.json({
            status: false,
            msg: "You haven't selected any student!"
        })
    }
    const recommendedStudents = [];
    for (let student of students) {
        let {_id: studentId, firstName, lastName, rating} = student;
        let isStudentExists = await RecommendedList.find({
            "studentId": studentId
        });
        if (!isStudentExists.length) {
            recommendedStudents.push({
                "studentId": studentId,
                "firstName": firstName,
                "lastName": lastName,
                "rating": rating
            })
        }
    }

    let recommended = await RecommendedList.insertMany(recommendedStudents);
    if(!recommended.length){
        res.json({
            status: false,
            msg: "Having some issue while createing the recommended list!!"
        })
    }
    else{
        res.json({
            status: true,
            msg: "Selected students got recomended successfully.",
            data: recommended
        })
    }
    
};

exports.removeFromRecomended = async (req,res)=>{
    let recommededId = req.params.recommendedId;
    if(!recommededId){
        res.json({
            status: false,
            msg: "Please give the recomended id in params!"
        })
    }
    let isDeleted = await RecommendedList.findByIdAndDelete(recommededId);
    if(!isDeleted){
        res.json({
            status: false,
            msg: "Unable to remove the student!!"
        })
    }
    else{
        res.json({
            status: true,
            msg: "The recommeded student successfully removed from the list!!"
        })
        
    }
}