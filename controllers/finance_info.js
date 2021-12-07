const finance_info = require("../models/finance_info");
const bcrypt = require('bcryptjs')

const addmemberModal = require("../models/addmember");
const { errorHandler } = require("../helpers/dbErrorHandler");
const _ = require("lodash");

exports.create = async (req, res) => {
	const { studentId, userId } = req.params;		
	const bodyInfo = req.body;

	const expiryDate = new Date(bodyInfo.expiry_year, bodyInfo.expiry_month);
	const hashedCard_Number = bcrypt.hashSync(bodyInfo.Card_Number, 10)
	const hashedCard_Cvv = bcrypt.hashSync(bodyInfo.card_cvv, 10)
	const cardExpiry = {
		expiryDate,
		userId,
	};

	const financeDetails = _.extend(bodyInfo, cardExpiry);
	financeDetails["studentId"] = studentId;
	financeDetails["Card_Number"] = hashedCard_Number;
	financeDetails["card_cvv"] = hashedCard_Cvv;

	const finance = await finance_info.create(financeDetails);

	if (!finance) {
		res.send({ status: false, error: "finance info is not add" });
	}

	const member = await addmemberModal.findByIdAndUpdate({ _id: studentId }, { $push: { finance_details: finance._id } });
	if (!member) {
		res.send({ status: false, error: "finance info is not add in student" });
	}
	res.send({ status: true, msg: "finance info is add in student", result: finance });
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
	const expiryDate = new Date(bodyInfo.expiry_year, bodyInfo.expiry_month);
	const cardExpiry = {
		expiryDate
	};

	const financeDetails = _.extend(bodyInfo, cardExpiry);
	if (bodyInfo.Card_Number) {
		const hashedCard_Number = bcrypt.hashSync(bodyInfo.Card_Number, 10)
		financeDetails["Card_Number"] = hashedCard_Number;

	} if (bodyInfo.card_cvv) {
		const hashedCard_Cvv = bcrypt.hashSync(bodyInfo.card_cvv, 10)
		financeDetails["card_cvv"] = hashedCard_Cvv;
	}

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
