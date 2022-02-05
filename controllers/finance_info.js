const finance_info = require('../models/finance_info');
const Expense = require('../models/expenses');
const bcrypt = require('bcryptjs');
const addmemberModal = require('../models/addmember');
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
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
			studentId,
		};

		const financeDetails = _.extend(bodyInfo, cardExpiry);
		const finance = await finance_info.create(financeDetails);

		if (!finance) {
			res.send({ status: false, msg: 'finance info is not add' });
		}

		const member = await addmemberModal.findByIdAndUpdate(
			{ _id: studentId },
			{ $push: { finance_details: finance._id } }
		);
		if (!member) {
			res.send({ status: false, msg: 'finance info is not add in student' });
		}
		res.send({
			status: true,
			msg: 'finance info is add in student',
			result: finance,
		});
	} catch (e) {
		res.send({ success: false, msg: e.message });
	}
};

exports.read = (req, res) => {
	finance_info
		.find({ studentId: req.params.studentId })
		.then((result) => {
			res.status(200).json({
				data: result,
			});
		})
		.catch((err) => {
			res.send({ error: err.message.replace(/\"/g, ''), success: false });
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
	const financeId = req.params.financeId;

	if (!financeId) {
		res.send({
			status: false,
			error: 'StudentId or UserId not found in params',
		});
	}
	const bodyInfo = req.body;
	const expiry_date = bodyInfo.expiry_month + bodyInfo.expiry_year;
	delete bodyInfo.expiry_month;
	delete bodyInfo.expiry_year;
	const cardExpiry = {
		expiry_date,
	};
	const financeDetails = _.extend(bodyInfo, cardExpiry);
	finance_info
		.findByIdAndUpdate(financeId, {
			$set: financeDetails,
		})
		.then((update_resp) => {
			res.send({
				message: 'finance Info has been updated for this student successfully',
				status: true,
			});
		})
		.catch((err) => {
			res.send({ error: err.message.replace(/\"/g, ''), status: false });
		});
};

exports.remove = (req, res) => {
	const id = req.params.financeId;
	finance_info
		.deleteOne({ _id: id })
		.then((resp) => {
			addmemberModal.update(
				{ finance_details: id },
				{ $pull: { finance_details: id } },
				function (err, data) {
					if (err) {
						res.send({ error: 'finance info is not delete in student' });
					} else {
						res.status(200).send({
							msg: 'finance_info is deleted successfully !',
							status: true,
						});
					}
				}
			);
		})
		.catch((err) => {
			res.send({ error: err.message.replace(/\"/g, ''), status: false });
		});
};

// fetch all credit card information with pagination
exports.fetchAllCC = async (req, res) => {
	const { page, perPage } = req.query;
	const { userId } = req.params;

	const limit = parseInt(perPage);
	let queryParams = { userId };

	const count = await finance_info.find(queryParams).countDocuments();
	const list = await finance_info
		.find(queryParams)
		.sort({ _id: -1 })
		.skip((parseInt(page) - 1) * limit)
		.limit(limit)
		.lean();
	res.json({ count, list });
};

exports.expenseStateByCategory = async (req, res) => {
	// fetch expese state
	const total = await Expense.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
		{
			$group: {
				_id: 'total',
				total: { $sum: '$amount' },
			},
		},
	]);
	let totalExpense = 0;
	if (total && total.length > 0) {
		totalExpense = total[0].total;
	}
	let expenses = await Expense.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
		{
			$group: {
				_id: '$category',
				amount: { $sum: '$amount' },
			},
		},
	]);
	expenses = expenses.map((x) => {
		let percentage = parseFloat((x.amount / totalExpense) * 100).toFixed(2);
		return {
			...x,
			percentage,
		};
	});
	return res.json(expenses);
};

exports.expenseMonthlyCompare = async (req, res) => {
	// Current Month
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();
	// Previous Month
	currentDate.setMonth(currentMonth - 1);
	const previousMonth = currentDate.getMonth();
	const previousYear = currentDate.getFullYear();

	let expenses = await Expense.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
		{
			$project: {
				amount: 1,
				category: 1,
				month: { $month: '$date' },
				year: { $year: '$date' },
			},
		},

		{
			$match: {
				$or: [
					{
						$and: [{ month: currentMonth }, { year: currentYear }],
					},
					{
						$and: [{ month: previousMonth }, { year: previousYear }],
					},
				],
			},
		},
		{
			$group: {
				_id: {
					month: '$month',
					year: '$year',
					category: '$category',
				},
				amount: { $sum: '$amount' },
			},
		},
	]);

	const categories = [...new Set(expenses.map((x) => x._id.category))];
	const expenseData = categories.map((x) => {
		let current = expenses.find(
			(expense) =>
				expense._id.month === currentMonth &&
				expense._id.year === currentYear &&
				x === expense._id.category
		);

		let previous = expenses.find(
			(expense) =>
				expense._id.month === previousMonth &&
				expense._id.year === previousYear &&
				x === expense._id.category
		);

		return {
			category: x,
			current: current ? current.amount : 0,
			previous: previous ? previous.amount : 0,
		};
	});

	return res.json(expenseData);
};

exports.todaysExpense = async (req, res) => {
	// Current Month
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentDay = currentDate.getDate();
	const currentYear = currentDate.getFullYear();

	let expenseData = await Expense.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
		{
			$project: {
				amount: 1,
				category: 1,
				month: { $month: '$date' },
				year: { $year: '$date' },
				day: { $dayOfMonth: '$date' },
			},
		},
		{ $match: { day: currentDay, month: currentMonth, year: currentYear } },
		{
			$group: {
				_id: '-',
				amount: { $sum: '$amount' },
			},
		},
	]);
	let expense = 0;
	if (expenseData && expenseData.length > 0) {
		expense = expenseData[0].amount;
	}

	return res.send(expense + '');
};

exports.weeklyExpense = async (req, res) => {
	// Current Month
	const currentDate = new Date();
	const sevenDaysAgo = new Date(moment(currentDate).subtract(6, 'days'));
	const _local_String_current = currentDate
		.toLocaleDateString(`fr-CA`)
		.split('/')
		.join('-');
	const _local_String_sevenDaysAgo = sevenDaysAgo
		.toLocaleDateString(`fr-CA`)
		.split('/')
		.join('-');

	const start = `${_local_String_sevenDaysAgo}T00:00:00.00Z`;
	const end = `${_local_String_current}T23:59:59.999Z`;

	let expenseData = await Expense.aggregate([
		{
			$match: {
				userId: mongoose.Types.ObjectId(req.params.userId),
				date: {
					$gte: new Date(start),
					$lt: new Date(end),
				},
			},
		},
		{
			$group: {
				_id: '-',
				amount: { $sum: '$amount' },
			},
		},
	]);

	let expense = 0;
	if (expenseData && expenseData.length > 0) {
		expense = expenseData[0].amount;
	}

	return res.send(expense + '');
};

exports.MonthlyExpense = async (req, res) => {
	// Current Month
	const currentDate = new Date();
	const _local_String_current = currentDate
		.toLocaleDateString(`fr-CA`)
		.split('/')
		.join('-');

	currentDate.setDate(1);
	const firstDateOfMonth = new Date(currentDate);
	const _local_String_firstDateofMonth = firstDateOfMonth
		.toLocaleDateString(`fr-CA`)
		.split('/')
		.join('-');

	const start = `${_local_String_firstDateofMonth}T00:00:00.00Z`;
	const end = `${_local_String_current}T23:59:59.999Z`;

	let expenseData = await Expense.aggregate([
		{
			$match: {
				userId: mongoose.Types.ObjectId(req.params.userId),
				date: {
					$gte: new Date(start),
					$lt: new Date(end),
				},
			},
		},
		{
			$group: {
				_id: '-',
				amount: { $sum: '$amount' },
			},
		},
	]);

	let expense = 0;
	if (expenseData && expenseData.length > 0) {
		expense = expenseData[0].amount;
	}

	return res.send(expense + '');
};

exports.thisYearExpense = async (req, res) => {
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();

	let expenseData = await Expense.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
		{
			$project: {
				amount: 1,
				year: { $year: '$date' },
			},
		},
		{ $match: { year: currentYear } },
		{
			$group: {
				_id: '-',
				amount: { $sum: '$amount' },
			},
		},
	]);
	let expense = 0;
	if (expenseData && expenseData.length > 0) {
		expense = expenseData[0].amount;
	}

	return res.send(expense + '');
};
