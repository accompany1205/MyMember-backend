const finance_info = require("../models/finance_info");
const bcrypt = require('bcryptjs')
const addmemberModal = require("../models/addmember");
const _ = require("lodash");

exports.create = async (req, res) => {
	try {
		const { studentId, userId } = req.params;		
		const bodyInfo = req.body;
	
		const expiry_date = bodyInfo.expiry_month + bodyInfo.expiry_year;
		delete bodyInfo.expiry_month;
		delete bodyInfo.expiry_year;
		const cardExpiry = {
			expiry_date,
			userId,
			studentId
		};
	
		const financeDetails = _.extend(bodyInfo, cardExpiry);
		const finance = await finance_info.create(financeDetails);
	
		if (!finance) {
			res.send({ status: false, msg: "finance info is not add" });
		}
	
		const member = await addmemberModal.findByIdAndUpdate({ _id: studentId }, { $push: { finance_details: finance._id } });
		if (!member) {
			res.send({ status: false, msg: "finance info is not add in student" });
		}
		res.send({ status: true, msg: "finance info is add in student", result: finance });
	} catch (e) {
		res.send({success: false, msg: e.message})
	}
};

exports.read = (req, res) => {

	finance_info
		.find({ studentId: req.params.studentId })
		.then((result) => {
			res.status(200).json({
				data: result
			});
		})
		.catch((err) => {
			res.send({ error: err.message.replace(/\"/g, ""), success: false })

		});
};

// exports.finance_Info = (req, res) => {
//     const id = req.params.financeId
//     finance_info.findById(id)
//         .then((result) => {
//             res.json(result)
//         }).catch((err) => {
//             res.send(err)
//         })
// };

exports.update = (req, res) => {
	const financeId = req.params.financeId

	if (!financeId) {
		res.send({ status: false, error: "StudentId or UserId not found in params" });
	}
	const bodyInfo = req.body;
	const expiry_date = bodyInfo.expiry_month + bodyInfo.expiry_year
	delete bodyInfo.expiry_month;
	delete bodyInfo.expiry_year;
	const cardExpiry = {
		expiry_date
	};
	const financeDetails = _.extend(bodyInfo, cardExpiry);
	finance_info
		.findByIdAndUpdate(financeId, {
			$set: financeDetails
		})
		.then((update_resp) => {
			res.send({
				message:
					"finance Info has been updated for this student successfully",
				status: true
			});
		})
		.catch((err) => {
			res.send({ error: err.message.replace(/\"/g, ""), status: false })
		});
};

exports.remove = (req, res) => {
	const id = req.params.financeId;
	finance_info
		.deleteOne({ _id: id })
		.then((resp) => {
			addmemberModal.update({ finance_details: id }, { $pull: { finance_details: id } }, function (err, data) {
				if (err) {
					res.send({ error: "finance info is not delete in student" });
				} else {
					res.status(200).send({ msg: "finance_info is deleted successfully !",status:true });
				}
			});
		})
		.catch((err) => {
			res.send({ error: err.message.replace(/\"/g, ""), status: false })

		});
};
