const finance_info = require('../models/finance_info');
const Expense = require('../models/expenses');
const ExpenseCategory = require('../models/expenses_category');
const BuyProduct = require('../models/buy_product');
const BuyMembership = require('../models/buy_membership');
const bcrypt = require('bcryptjs');
const addmemberModal = require('../models/addmember');
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
const cloudUrl = require('../gcloud/imageUrl');
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
		{ $sort: { amount: -1 } },
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
		{ $sort: { _id: 1 } },
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
	// Current Date
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

exports.expenseReportWithFilter = async (req, res) => {
	let { paymentSystem, month, year, page } = req.query;

	month = parseInt(month) + 1;
	year = parseInt(year);
	page = parseInt(page);

	let list = await Expense.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
		{
			$project: {
				category: 1,
				amount: 1,
				expenses: 1,
				month: { $month: '$date' },
				year: { $year: '$date' },
				description: 1,
				date: 1,
				expense_image: 1,
				subject: 1,
			},
		},
		{ $match: { year, month, expenses: paymentSystem } },
	]);

	let totalExpenseAmt = await Expense.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
		{
			$project: {
				category: 1,
				amount: 1,
				expenses: 1,
				month: { $month: '$date' },
				year: { $year: '$date' },
				description: 1,
				date: 1,
				expense_image: 1,
				subject: 1,
			},
		},
		{ $match: { year, month, expenses: paymentSystem } },
		{
			$group: {
				_id: 'totalAmount',
				amount: { $sum: '$amount' },
			},
		},
	]);

	let totalExpense = 0;
	if (totalExpenseAmt && totalExpenseAmt.length > 0) {
		totalExpense = totalExpenseAmt[0].amount;
	}

	const data = [];
	for (let item of list) {
		let date = moment(item.date).format('YYYY-MM-DD');
		const find = data.find((x) => x.date === date);
		if (find) {
			// push
			find.data.push(item);
		} else {
			data.push({ date, data: [item] });
		}
	}

	return res.json({
		list: data.sort((a, b) => new Date(a.date) - new Date(b.date)),
		total: 0,
		totalExpense,
	});
};

exports.expenseCategoryAdd = async (req, res) => {
	try {
		var userId = req.params.userId;
		const { expense_category_type, color } = req.body;
		if (!expense_category_type || expense_category_type === '')
			throw Error('category is required');
		// check existing
		const exist = await ExpenseCategory.findOne({
			expense_category_type,
			userId,
		});
		if (exist) throw Error('Category Alreay Exist');

		var newCategory = await new ExpenseCategory({
			userId,
			expense_category_type,
			color,
			expenses: [],
		}).save();
		res.json(newCategory);
	} catch (err) {
		throw Error(err);
	}
};

// Expense Add
exports.expenseAdd = async (req, res) => {
	try {
		var userId = req.params.userId;
		const { amount, category, description, expenses, date, subject } = req.body;

		console.log();

		var imageUrl = '';
		if (req.file !== undefined) {
			imageUrl = await cloudUrl.imageUrl(req.file);
		}

		var expense = await new Expense({
			userId,
			amount,
			category,
			description,
			expenses,
			date,
			subject,
			expense_image: imageUrl,
		}).save();

		await ExpenseCategory.findOneAndUpdate(
			{ expense_category_type: category },
			{ $push: { expenses: expense } }
		);

		res.json(expense);
	} catch (err) {
		throw Error(err);
	}
};

exports.todaysIncome = async (req, res) => {
	// Current Date
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentDay = currentDate.getDate();
	const currentYear = currentDate.getFullYear();
	// buy product income
	const incomeByProductArray = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId } },
		{
			$project: {
				total_price: 1,
				balance: 1,
				month: { $month: '$createdAt' },
				year: { $year: '$createdAt' },
				day: { $dayOfMonth: '$createdAt' },
			},
		},
		{ $match: { day: currentDay, month: currentMonth, year: currentYear } },
		{
			$group: {
				_id: '-',
				balance: { $sum: '$balance' },
				total_price: { $sum: '$total_price' },
			},
		},
	]);

	let incomeFromProduct = 0;
	if (incomeByProductArray && incomeByProductArray.length > 0) {
		incomeFromProduct =
			incomeByProductArray[0].total_price - incomeByProductArray[0].balance;
	}

	// [+] buy membership income ***====================================

	const incomeByMembershipArray = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId } },
		{
			$project: {
				totalp: 1,
				balance: 1,
				dpayment: 1,
				register_fees: 1,
				month: { $month: '$createdAt' },
				year: { $year: '$createdAt' },
				day: { $dayOfMonth: '$createdAt' },
			},
		},
		{ $match: { day: currentDay, month: currentMonth, year: currentYear } },

		{
			$group: {
				_id: '-',
				balance: { $sum: '$balance' },
				totalp: { $sum: '$totalp' },
				register_fees: { $sum: '$register_fees' },
			},
		},
	]);

	let incomeFromMembership = 0;
	if (incomeByMembershipArray && incomeByMembershipArray.length > 0) {
		incomeFromMembership =
			incomeByMembershipArray[0].totalp -
			incomeByMembershipArray[0].balance +
			incomeByMembershipArray[0].register_fees;
	}
	const date = moment(new Date()).format('YYYY-MM-DD');
	const dates = [date];

	// @ product EMI income
	const p2 = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				name: '$student_name',
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				type: 'Product Sale-EMI',
				status: '$schedulePayments.status',
				ptype: '$schedulePayments.ptype',
			},
		},
		{
			$match: { date: { $in: dates }, status: 'paid' },
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$amount' },
			},
		},
	]);

	// @ membership EMI Income
	const m2 = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				status: '$schedulePayments.status',
			},
		},
		{
			$match: { date: { $in: dates }, status: 'paid' },
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$amount' },
			},
		},
	]);

	let emiIncome = 0;
	if (p2 && p2.length > 0) {
		emiIncome += p2[0].balance;
	}

	if (m2 && m2.length > 0) {
		emiIncome += m2[0].balance;
	}

	const total = parseFloat(
		incomeFromProduct + incomeFromMembership + emiIncome
	).toFixed(2);

	res.json(total + '');
};

exports.weeklyIncome = async (req, res) => {
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

	// Income From Product
	const incomeByProductArray = await BuyProduct.aggregate([
		{
			$project: {
				total_price: 1,
				balance: 1,
				userId: 1,
				createdAt: 1,
			},
		},
		{
			$match: {
				userId: req.params.userId,
				createdAt: {
					$gte: new Date(start),
					$lt: new Date(end),
				},
			},
		},

		{
			$group: {
				_id: '-',
				balance: { $sum: '$balance' },
				total_price: { $sum: '$total_price' },
			},
		},
	]);

	let incomeFromProduct = 0;
	if (incomeByProductArray && incomeByProductArray.length > 0) {
		incomeFromProduct =
			incomeByProductArray[0].total_price - incomeByProductArray[0].balance;
	}

	// [+] buy membership income ***====================================
	const incomeByMembershipArray = await BuyMembership.aggregate([
		{
			$match: {
				userId: req.params.userId,
				createdAt: {
					$gte: new Date(start),
					$lt: new Date(end),
				},
			},
		},
		{
			$project: {
				totalp: 1,
				balance: 1,
				dpayment: 1,
				createdAt: 1,
				register_fees: 1,
			},
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$balance' },
				totalp: { $sum: '$totalp' },
				register_fees: { $sum: '$register_fees' },
			},
		},
	]);

	let incomeFromMembership = 0;
	if (incomeByMembershipArray && incomeByMembershipArray.length > 0) {
		incomeFromMembership =
			incomeByMembershipArray[0].totalp -
			incomeByMembershipArray[0].balance +
			incomeByMembershipArray[0].register_fees;
	}

	// Date range

	let dates = [];
	for (
		sevenDaysAgo;
		sevenDaysAgo <= currentDate;
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() + 1)
	) {
		dates.push(moment(sevenDaysAgo).format('YYYY-MM-DD'));
	}

	// @ product EMI income
	const p2 = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				name: '$student_name',
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				type: 'Product Sale-EMI',
				status: '$schedulePayments.status',
				ptype: '$schedulePayments.ptype',
			},
		},
		{
			$match: { date: { $in: dates }, status: 'paid' },
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$amount' },
			},
		},
	]);

	// @ membership EMI Income
	const m2 = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				status: '$schedulePayments.status',
			},
		},
		{
			$match: { date: { $in: dates }, status: 'paid' },
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$amount' },
			},
		},
	]);

	let emiIncome = 0;
	if (p2 && p2.length > 0) {
		emiIncome += p2[0].balance;
	}

	if (m2 && m2.length > 0) {
		emiIncome += m2[0].balance;
	}

	const total = parseFloat(
		incomeFromProduct + incomeFromMembership + emiIncome
	).toFixed(2);
	res.json(total + '');
};

exports.MonthlyIncome = async (req, res) => {
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

	// Income From Product
	const incomeByProductArray = await BuyProduct.aggregate([
		{
			$project: {
				total_price: 1,
				balance: 1,
				userId: 1,
				createdAt: 1,
			},
		},
		{
			$match: {
				userId: req.params.userId,
				createdAt: {
					$gte: new Date(start),
					$lt: new Date(end),
				},
			},
		},

		{
			$group: {
				_id: '-',
				balance: { $sum: '$balance' },
				total_price: { $sum: '$total_price' },
			},
		},
	]);

	let incomeFromProduct = 0;
	if (incomeByProductArray && incomeByProductArray.length > 0) {
		incomeFromProduct =
			incomeByProductArray[0].total_price - incomeByProductArray[0].balance;
	}

	// [+] buy membership income ***====================================
	const incomeByMembershipArray = await BuyMembership.aggregate([
		{
			$match: {
				userId: req.params.userId,
				createdAt: {
					$gte: new Date(start),
					$lt: new Date(end),
				},
			},
		},
		{
			$project: {
				totalp: 1,
				balance: 1,
				dpayment: 1,
				createdAt: 1,
				register_fees: 1,
			},
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$balance' },
				totalp: { $sum: '$totalp' },
				register_fees: { $sum: '$register_fees' },
			},
		},
	]);

	let incomeFromMembership = 0;
	if (incomeByMembershipArray && incomeByMembershipArray.length > 0) {
		incomeFromMembership =
			incomeByMembershipArray[0].totalp -
			incomeByMembershipArray[0].balance +
			incomeByMembershipArray[0].register_fees;
	}

	const month = currentDate.getMonth() + 1;
	const year = currentDate.getFullYear();

	var firstDayOfMonth = new Date(`${year}-${month}-01`);
	var lastDayOfMonth = new Date(year, month, 0);
	let dates = [];
	for (
		firstDayOfMonth;
		firstDayOfMonth <= lastDayOfMonth;
		firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1)
	) {
		dates.push(moment(firstDayOfMonth).format('YYYY-MM-DD'));
	}

	// @ product EMI income
	const p2 = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				name: '$student_name',
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				type: 'Product Sale-EMI',
				status: '$schedulePayments.status',
				ptype: '$schedulePayments.ptype',
			},
		},
		{
			$match: { date: { $in: dates }, status: 'paid' },
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$amount' },
			},
		},
	]);

	// @ membership EMI Income
	const m2 = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				status: '$schedulePayments.status',
			},
		},
		{
			$match: { date: { $in: dates }, status: 'paid' },
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$amount' },
			},
		},
	]);

	let emiIncome = 0;
	if (p2 && p2.length > 0) {
		emiIncome += p2[0].balance;
	}

	if (m2 && m2.length > 0) {
		emiIncome += m2[0].balance;
	}

	const total = parseFloat(
		incomeFromProduct + incomeFromMembership + emiIncome
	).toFixed(2);
	res.json(total + '');
};
exports.thisYearIncome = async (req, res) => {
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();

	const incomeByProductArray = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId } },
		{
			$project: {
				total_price: 1,
				balance: 1,
				year: { $year: '$createdAt' },
			},
		},
		{ $match: { year: currentYear } },
		{
			$group: {
				_id: '-',
				balance: { $sum: '$balance' },
				total_price: { $sum: '$total_price' },
			},
		},
	]);

	let incomeFromProduct = 0;
	if (incomeByProductArray && incomeByProductArray.length > 0) {
		incomeFromProduct =
			incomeByProductArray[0].total_price - incomeByProductArray[0].balance;
	}

	// [+] buy membership income ***====================================
	const incomeByMembershipArray = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId } },

		{
			$project: {
				totalp: 1,
				balance: 1,
				dpayment: 1,
				register_fees: 1,
				year: { $year: '$createdAt' },
			},
		},
		{ $match: { year: currentYear } },
		{
			$group: {
				_id: '-',
				balance: { $sum: '$balance' },
				totalp: { $sum: '$totalp' },
				register_fees: { $sum: '$register_fees' },
			},
		},
	]);

	let incomeFromMembership = 0;
	if (incomeByMembershipArray && incomeByMembershipArray.length > 0) {
		incomeFromMembership =
			incomeByMembershipArray[0].totalp -
			incomeByMembershipArray[0].balance +
			incomeByMembershipArray[0].register_fees;
	}

	// dates
	const _d = new Date();
	var firstDayOfMonth = new Date(`${_d.getFullYear()}-${1}-01`);
	var lastDayOfMonth = new Date(_d.getFullYear(), 12, 0);

	let dates = [];
	for (
		firstDayOfMonth;
		firstDayOfMonth <= lastDayOfMonth;
		firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1)
	) {
		dates.push(moment(firstDayOfMonth).format('YYYY-MM-DD'));
	}

	// @ product EMI income
	const p2 = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				name: '$student_name',
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				type: 'Product Sale-EMI',
				status: '$schedulePayments.status',
				ptype: '$schedulePayments.ptype',
			},
		},
		{
			$match: { date: { $in: dates }, status: 'paid' },
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$amount' },
			},
		},
	]);

	// @ membership EMI Income
	const m2 = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				status: '$schedulePayments.status',
			},
		},
		{
			$match: { date: { $in: dates }, status: 'paid' },
		},
		{
			$group: {
				_id: '-',
				balance: { $sum: '$amount' },
			},
		},
	]);

	let emiIncome = 0;
	if (p2 && p2.length > 0) {
		emiIncome += p2[0].balance;
	}

	if (m2 && m2.length > 0) {
		emiIncome += m2[0].balance;
	}

	const total = parseFloat(
		incomeFromProduct + incomeFromMembership + emiIncome
	).toFixed(2);

	res.json(total + '');
};

/////////////////////////
/////////////////////////
// Income report with filter
exports.IncomeReportWithFilters = async (req, res) => {
	let { paymentSystem, month, year } = req.query;

	month = parseInt(month) + 1;
	year = parseInt(year);

	var firstDayOfMonth = new Date(`${year}-${month}-01`);
	var lastDayOfMonth = new Date(year, month, 0);
	let dates = [];
	for (
		firstDayOfMonth;
		firstDayOfMonth <= lastDayOfMonth;
		firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1)
	) {
		dates.push(moment(firstDayOfMonth).format('YYYY-MM-DD'));
	}

	const p1 = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId, pay_inout: paymentSystem } },
		{
			$project: {
				name: '$student_name',
				amount: '$deposite',
				date: '$createdAt',
				type: 'Product Sale',
				status: 'paid',
				month: { $month: '$createdAt' },
				year: { $year: '$createdAt' },
				ptype: 1,
			},
		},
		{
			$match: { month, year },
		},
	]);

	const p2 = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId, pay_inout: paymentSystem } },
		{ $unwind: '$schedulePayments' },
		{
			$project: {
				name: '$student_name',
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				type: 'Product Sale-EMI',
				status: '$schedulePayments.status',
				ptype: '$schedulePayments.ptype',
			},
		},
		{
			$match: { date: { $in: dates } },
		},
	]);

	// **=========================================================
	// **=========================================================
	// Membership Income

	const m1 = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId, pay_inout: paymentSystem } },
		{
			$project: {
				name: '$student_name',
				amount: { $add: ['$register_fees', '$dpayment'] },
				date: '$createdAt',
				subject: '$membership_name',
				type: 'Membership',
				ptype: 1,
				month: { $month: '$createdAt' },
				year: { $year: '$createdAt' },
				status: 'paid',
			},
		},
		{
			$match: { month, year },
		},
	]);

	const m2 = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId, pay_inout: paymentSystem } },

		{ $unwind: '$schedulePayments' },
		{
			$project: {
				name: '$student_name',
				amount: '$schedulePayments.Amount',
				date: '$schedulePayments.date',
				type: 'Membership-EMI',
				status: '$schedulePayments.status',
				ptype: '$schedulePayments.ptype',
			},
		},
		{
			$match: { date: { $in: dates } },
		},
	]);

	const list = [...p1, ...p2, ...m1, ...m2];
	const data = [];
	for (let item of list) {
		let date = moment(item.date).format('YYYY-MM-DD');
		const find = data.find((x) => x.date === date);
		if (find) {
			// push
			find.data.push(item);
		} else {
			data.push({ date, data: [item] });
		}
	}

	return res.json(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
};

exports.PnlReportGenerate = async (req, res) => {
	let { firstMonth, firstYear, secondMonth, secondYear, ytd } = req.query;

	firstMonth = parseInt(firstMonth) + 1;
	firstYear = parseInt(firstYear);
	secondMonth = parseInt(secondMonth) + 1;
	secondYear = parseInt(secondYear);
	ytd = parseInt(ytd);

	let expenses = await Expense.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
		{
			$project: {
				category: 1,
				amount: 1,
				year: { $year: '$date' },
				month: { $month: '$date' },
				firstMonth: { $month: '$date' },
				firstYear: { $year: '$date' },
				secondMonth: { $month: '$date' },
				secondYear: { $year: '$date' },
			},
		},

		{
			$match: {
				$or: [
					{
						firstMonth,
						firstYear,
					},
					{ secondMonth, secondYear },
					{
						year: ytd,
					},
				],
			},
		},

		{
			$group: {
				_id: {
					month: '$month',
					year: '$year',
				},
				total: { $sum: '$amount' },
			},
		},
	]);

	return res.json(expenses);
};
