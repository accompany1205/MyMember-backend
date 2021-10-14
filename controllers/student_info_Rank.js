const program = require("../models/program");
const program_rank = require("../models/program_rank");
const addmemberModal = require("../models/addmember");
const student_info_Rank = require('../models/student_info_Rank')
const Joi = require('@hapi/joi')


exports.addRank = async (req, res) => {

    let studentInfoRankModal = Joi.object({
        programName: Joi.string().max(32).required(),
        rank_name: Joi.string().required()
        
    })
    try {
        await studentInfoRankModal.validateAsync(req.body);
        const studentId = req.params.studentId
        const data = await program_rank.findOne({ rank_name: req.body.rank_name }, { _id: 0, rank_image: 1, rank_name: 1, day_to_ready: 1 })

        const resp = new student_info_Rank({
            programName: req.body.programName,
            rank_name: req.body.rank_name,
            day_to_ready: data.day_to_ready,
            rank_image: data.rank_image,
            studentId: studentId
        })
        resp.save(async (er, data) => {
            if (er) {
                res.send({ error: err.message.replace(/\"/g, ""), success: false })
            }
            // await addmemberModal.findByIdAndUpdate({ _id: studentId },
            //     {
            //         $push: { rank_update_history: data }
            //     });
            res.json({
                success: true,
                msg: "Rank updated successfully",
                data: data
            })
        })
    }
    catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }
}


exports.getRank = async (req, res) => {

    try {
        const studentId = req.params.studentId
        console.log(studentId)
        const data = await student_info_Rank.find({ studentId: studentId })
        console.log(data)
        res.send({ data: data })
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), status: false })
    }

}

exports.updateRank = async (req, res) => {
    try {
        const rankId = req.params.rankId
        await student_info_Rank.findByIdAndUpdate(rankId, { $set: req.body })
        res.status(200).send({ message: 'rank_update_history is updated Successfully', success: true })

    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), status: false })
    }
}

exports.removeRank = async (req, res) => {
    const id = req.params.rankId;
    await student_info_Rank.deleteOne({ _id: id })
        .then((resp) => {
            res.status(200).send({ msg: "rank_update_history is deleted successfully !", status: true });
        })
        // .then((resp) => {
        // 	addmemberModal.updateOne({rank_update_history: resp._id }, { $pull: {rank_update_history:id } }, function (err, data) {
        // 		if (err) {
        // 		res.send({ error: "rank_update_history info is not delete in student" });
        // 		} else {
        // 			res.status(200).send({ msg: "rank_update_history is deleted successfully !",status:data });
        // 		}
        // 	});
        // })
        .catch((err) => {
            res.send({ error: err.message.replace(/\"/g, ""), status: false })

        });
};
