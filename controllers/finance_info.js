const finance_info = require("../models/finance_info");
const addmemberModal = require("../models/addmember");
const { errorHandler } = require("../helpers/dbErrorHandler");
const _ = require("lodash");

exports.create = async (req, res) => {
	const { studentId, userId } = req.params;
	if (!studentId || !userId) {
		res.send({ status: false, error: "StudentId or UserId not found in params" });
	}
	const bodyInfo = req.body;

	const expiryDate = new Date(bodyInfo.expiry_year, bodyInfo.expiry_month);

	const cardExpiry = {
		expiryDate,
		userId,
	};

	const financeDetails = _.extend(bodyInfo, cardExpiry);
	financeDetails["studentId"] = studentId;

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
	console.log(req.params.studentId);
	finance_info
		.find({ student_Id: req.params.studentId })
		.then((result) => {
			res.json(result);
		})
		.catch((err) => {
			console.log(err);
			res.send(err);
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
	const id = req.params.financeId;
	finance_info
		.updateOne({ _id: id }, { $set: req.body })
		.then((update_resp) => {
			console.log(update_resp);
			res.send("finance Info has been updated for this student successfully");
		})
		.catch((err) => {
			console.log(err);
			res.send(err);
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
					res.send({ msg: "finance info is delete in student" });
				}
			});
		})
		.catch((err) => {
			console.log(err);
			res.send(err);
		});
};
