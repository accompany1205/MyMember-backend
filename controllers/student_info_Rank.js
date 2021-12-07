const program = require("../models/program");
const program_rank = require("../models/program_rank");
const addmemberModal = require("../models/addmember");
const student_info_Rank = require('../models/student_info_Rank')
const RecommendedForTest = require('../models/recommendedForTest');
const RegisterdForTest = require('../models/registerdForTest');
const Member = require('../models/addmember');
const Joi = require('@hapi/joi')



exports.addRank = async (req, res) => {

    try {
        const studentId = req.params.studentId
        const Crank = req.body.current_rank_name
        const Nrank = req.body.next_rank_name
        const program = req.body.programName
        const data = await program_rank.findOne({ rank_name: Crank }, { _id: 0, rank_image: 1, rank_name: 1, day_to_ready: 1 })
        const data1 = await program_rank.findOne({ rank_name: Nrank }, { _id: 0, rank_image: 1, rank_name: 1, day_to_ready: 1 })
        const recommedtTest = await RecommendedForTest.findOne({"studentId":studentId,"isDeleted":false})
        if(recommedtTest !== null){
            await RecommendedForTest.findOneAndUpdate({"studentId":studentId, "isDeleted":false}, {"current_rank_name":Crank, "next_rank_name":Nrank,"current_rank_img": data.rank_image,"next_rank_img":data1.rank_image,"program":program})
        }
        const registerTest = await RegisterdForTest.findOne({"studentId":studentId, "isDeleted":false})
        if(registerTest !== null){
            await RegisterdForTest.findOneAndUpdate({"studentId":studentId,"isDeleted":false}, {"current_rank_name":Crank, "next_rank_name":Nrank,"current_rank_img": data.rank_image,"next_rank_img":data1.rank_image,"program":program})
        }
        await Member.findOneAndUpdate({"studentId":studentId}, {current_rank_name: Crank, next_rank_name: Nrank, current_rank_img:data.rank_image,next_rank_img: data1.rank_image, program:program});
        const resp = new student_info_Rank({
            programName: program,
            rank_name: Crank,
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
        const data = await student_info_Rank.find({ studentId: studentId })
        res.send({ data: data })
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), status: false })
    }

}

exports.updateRank = async (req, res) => {
    try {
        const rankId = req.params.rankId;
        const studentId = req.params.studentId;
        const cRank = req.body.current_rank_name;
        const nRank = req.body.next_rank_name;
        const program = req.body.programName;
        const data1 = await program_rank.findOne({ rank_name: cRank }, { _id: 0, rank_image: 1, rank_name: 1, day_to_ready: 1 })
        const data2 = await program_rank.findOne({ rank_name: nRank }, { _id: 0, rank_image: 1, rank_name: 1, day_to_ready: 1 })
        cosnole.log("---->",data2.rank_image, data1.rank_image)
        if(!data1.rank_image || !data2.rank_image){
            throw new Error("Either Current-Rank or Next-Rank don't have rank Image")
        }
        await student_info_Rank.findOneAndUpdate({_id:rankId,studentId:studentId}, { $set: {rank_name:cRank, rank_image:data1.rank_image, programName:program} })
        await Member.findOneAndUpdate({"studentId":studentId}, {current_rank_name: cRank, current_rank_img:data1.rank_image, program:program, });
        const recommedtTest = await RecommendedForTest.findOne({"studentId":studentId, isDeleted:false})
        if(recommedtTest !== null){
            await RecommendedForTest.findOneAndUpdate({"studentId":studentId,isDeleted:false}, {"current_rank_name":cRank, "next_rank_name":nRank, "current_rank_img": data1.rank_image,"next_rank_img":data2.rank_image,"program":program })
        }
        const registerTest = await RegisterdForTest.findOne({"studentId":studentId, isDeleted:false})
        if(registerTest !== null){
             await RegisterdForTest.findOneAndUpdate({"studentId":studentId,isDeleted:false}, {"current_rank":data1.rank_name, "next_rank":data2.rank_name, "program":program})
        }
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
