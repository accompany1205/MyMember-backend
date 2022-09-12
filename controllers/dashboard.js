const finance_info = require('../models/finance_info');
const Expense = require('../models/expenses');
const ExpenseCategory = require('../models/expenses_category');
const BuyProduct = require('../models/buy_product');
const BuyMembership = require('../models/buy_membership');
const bcrypt = require('bcryptjs');
const addmemberModal = require('../models/addmember');
const MyTask = require('../models/task');
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
var MemberModel = require('../models/addmember');

const { dateRangeBuild } = require('./../utilities/dateRangeProcess');

// Sale statistics
exports.getSalesStaticTics = async (req, res) => {
	let date = new Date();
	// today ======================
	let { start, end } = dateRangeBuild(date, date);
	// fetch today =============================================================
	// fetch today =============================================================
	const todayRange = {
		userId: req.params.userId,
		createdAt: {
			$gte: start,
			$lt: end,
		},
	};

	let dailyTotalMembership = await BuyMembership.countDocuments(todayRange);
	let dailyTotalBuyProduct = await BuyProduct.countDocuments(todayRange);

	// fetch today =============================================================
	// fetch today =============================================================
	let sevenDayLeft = moment(date).subtract(7, 'days');
	let { start: weekStart, end: weekend } = dateRangeBuild(sevenDayLeft, date);

	const weeklyRange = {
		userId: req.params.userId,
		createdAt: {
			$gte: weekStart,
			$lt: weekend,
		},
	};
	let weeklyTotalMembership = await BuyMembership.countDocuments(weeklyRange);
	let weeklyTotalBuyProduct = await BuyProduct.countDocuments(weeklyRange);

	// Monthly ===========================================
	var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
	let { start: monthStart, end: monthEnd } = dateRangeBuild(
		firstDayOfMonth,
		date
	);
	const MonthlyRange = {
		userId: req.params.userId,
		createdAt: {
			$gte: monthStart,
			$lt: monthEnd,
		},
	};

	let monthlyTotalMembership = await BuyMembership.countDocuments(MonthlyRange);
	let monthlyTotalBuyProduct = await BuyProduct.countDocuments(MonthlyRange);

	const today = dailyTotalMembership + dailyTotalBuyProduct;
	const weekly = weeklyTotalMembership + weeklyTotalBuyProduct;
	const monthly = monthlyTotalMembership + monthlyTotalBuyProduct;

	res.send({
		today,
		weekly,
		monthly,
	});
};

// Sale statistics
exports.getDateRangePaymentDue = async (req, res) => {
	const { startDate, endDate } = req.query;
	// today ======================
	let { start, end } = dateRangeBuild(startDate, endDate);
	// fetch today =============================================================
	const todayRange = {
		_date: {
			$gte: start,
			$lt: end,
		},
	};

	const membership = await BuyMembership.aggregate([
		{ $match: { userId: req.params.userId } },
		{
			$project: {
				schedulePayments: 1,
			},
		},
		{
			$unwind: '$schedulePayments',
		},
		{
			$project: {
				schedulePayments: 1,
				_date: {
					$convert: {
						input: '$schedulePayments.date',
						to: 'date',
						onError: 'null',
						onNull: 'null',
					},
				},
				status: '$schedulePayments.status',
			},
		},
		{
			$match: { ...todayRange, status: 'due' },
		},
		{
			$count: 'total',
		},
	]);

	const buyProduct = await BuyProduct.aggregate([
		{ $match: { userId: req.params.userId } },
		{
			$project: {
				schedulePayments: 1,
			},
		},
		{
			$unwind: '$schedulePayments',
		},
		{
			$project: {
				schedulePayments: 1,
				_date: {
					$convert: {
						input: '$schedulePayments.date',
						to: 'date',
						onError: 'null',
						onNull: 'null',
					},
				},
				status: '$schedulePayments.status',
			},
		},
		{
			$match: { ...todayRange, status: 'due' },
		},
		{
			$count: 'total',
		},
	]);

	let totalDue = 0;

	if (membership && membership.length > 0) {
		totalDue += membership[0].total;
	}
	if (buyProduct && buyProduct.length > 0) {
		totalDue += buyProduct[0].total;
	}
	res.send(totalDue + '');
};

// Sale statistics
exports.getStudentCountData = async (req, res) => {
	const memberData = await MemberModel.aggregate([
		{ $match: { userId: req.params.userId } },
		{
			$project: {
				studentType: 1,
			},
		},
		{
			$group: {
				_id: '$studentType',
				total: {
					$sum: 1,
				},
			},
		},
	]);

	const labels = [
		'Former Trial',
		'Leads',
		'Active Student',
		'Former Student',
		'Active Trial',
	];

	const datasets = labels.map((label) => {
		const find = memberData.find((x) => String(x._id) === String(label));
		return find ? find.total : 0;
	});

	res.send({
		labels,
		datasets,
	});
};

exports.active_trial_this_month = async (req, res) => {
	const userId = req.params.userId;

	const date = new Date();

	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

	let { start, end } = dateRangeBuild(firstDayOfMonth, date);

	const thisMonthDateRange = {
		createdAt: {
			$gte: start,
			$lt: end,
		},
	};

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};

		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						studentType: 'Active Trial',
						...thisMonthDateRange,
					},
				},
				{
					$project: {
						createdAt: 1,
						status: 1,
						firstName: 1,
						lastName: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;

					if (data.length > 0) {
						let data = memberdata[0].paginatedResults;
						if (data.length > 0) {
							res.send({
								data: data,
								totalCount: memberdata[0].totalCount[0].count,
								success: true,
							});
						} else {
							res.send({ msg: 'data not found', success: false });
						}
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		console.log(err);
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.active_trial_all_time = async (req, res) => {
	const userId = req.params.userId;

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						studentType: 'Active Trial',
					},
				},
				{
					$project: {
						createdAt: 1,
						status: 1,
						firstName: 1,
						lastName: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						let data = memberdata[0].paginatedResults;
						if (data.length > 0) {
							res.send({
								data: data,
								totalCount: memberdata[0].totalCount[0].count,
								success: true,
							});
						} else {
							res.send({ msg: 'data not found', success: false });
						}
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.leads_this_month = async (req, res) => {
	const userId = req.params.userId;

	const date = new Date();

	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

	let { start, end } = dateRangeBuild(firstDayOfMonth, date);

	const thisMonthDateRange = {
		createdAt: {
			$gte: start,
			$lt: end,
		},
	};

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						studentType: 'Leads',
						...thisMonthDateRange,
					},
				},
				{
					$project: {
						createdAt: 1,
						status: 1,
						firstName: 1,
						lastName: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						let data = memberdata[0].paginatedResults;
						if (data.length > 0) {
							res.send({
								data: data,
								totalCount: memberdata[0].totalCount[0].count,
								success: true,
							});
						} else {
							res.send({ msg: 'data not found', success: false });
						}
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};
exports.leads_all_time = async (req, res) => {
	const userId = req.params.userId;

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						studentType: 'Leads',
					},
				},
				{
					$project: {
						createdAt: 1,
						status: 1,
						firstName: 1,
						lastName: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						let data = memberdata[0].paginatedResults;
						if (data.length > 0) {
							res.send({
								data: data,
								totalCount: memberdata[0].totalCount[0].count,
								success: true,
							});
						} else {
							res.send({ msg: 'data not found', success: false });
						}
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.member_list_this_month = async (req, res) => {
	const userId = req.params.userId;

	const date = new Date();
	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
	let { start, end } = dateRangeBuild(firstDayOfMonth, date);

	const thisMonthDateRange = {
		createdAt: {
			$gte: start,
			$lt: end,
		},
	};

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						...thisMonthDateRange,
					},
				},
				{
					$project: {
						createdAt: 1,
						status: 1,
						firstName: 1,
						lastName: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						let data = memberdata[0].paginatedResults;
						if (data.length > 0) {
							res.send({
								data: data,
								totalCount: memberdata[0].totalCount[0].count,
								success: true,
							});
						} else {
							res.send({ msg: 'data not found', success: false });
						}
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};
exports.member_list_all_time = async (req, res) => {
	const userId = req.params.userId;

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
					},
				},
				{
					$project: {
						createdAt: 1,
						status: 1,
						firstName: 1,
						lastName: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						let data = memberdata[0].paginatedResults;
						if (data.length > 0) {
							res.send({
								data: data,
								totalCount: memberdata[0].totalCount[0].count,
								success: true,
							});
						} else {
							res.send({ msg: 'data not found', success: false });
						}
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

// Birthday

exports.birthday_this_month = async (req, res) => {
	var per_page = parseInt(req.params.per_page) || 5;
	var page_no = parseInt(req.params.page_no) || 0;
	var pagination = {
		limit: per_page,
		skip: per_page * page_no,
	};

	const currentMonth = new Date().getMonth() + 1;

	var today = new Date();
	var a1 = {
		$addFields: {
			today: {
				$dateFromParts: {
					year: { $year: today },
					month: { $month: today },
					day: { $dayOfMonth: today },
				},
			},
			birthdayThisYear: {
				$dateFromParts: {
					year: { $year: today },
					month: { $month: '$dob' },
					day: { $dayOfMonth: '$dob' },
				},
			},
			birthdayNextYear: {
				$dateFromParts: {
					year: { $add: [1, { $year: today }] },
					month: { $month: '$dob' },
					day: { $dayOfMonth: '$dob' },
				},
			},
		},
	};
	var a2 = {
		$addFields: {
			nextBirthday: {
				$cond: [
					{ $gte: ['$birthdayThisYear', '$today'] },
					'$birthdayThisYear',
					'$birthdayNextYear',
				],
			},
		},
	};

	let userId = req.params.userId;
	try {
		await addmemberModal
			.aggregate([
				{ $match: { userId: userId } },
				a1,
				a2,
				{
					$project: {
						daysTillBirthday: {
							$subtract: [
								{$divide: [
								{ $subtract: ['$nextBirthday', '$today'] },
								24 * 60 * 60 * 1000 /* milliseconds in a day */,
							]},1]
						},
						firstName: 1,
						dob: 1,
						studentType: 1,
						lastName: 1,
						primaryPhone: 1,
						current_rank_img: 1,
						program: 1,
						notes: 1,
						dobMonth: {
							$month: '$dob',
						},
					},
				},
				{
					$match: {
						dobMonth: currentMonth,
					},
				},
				{ $sort: { daysTillBirthday: 1 } },
				{
					$match: {
						daysTillBirthday: {
							$lte: 30,
							$gte: -1,
						},
					},
				},
				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						error: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						res.send({
							data: data,
							totalCount: memberdata[0].totalCount[0].count,
							success: true,
						});
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (er) {
		res.send(err);
	}
};
exports.birthday_all_time = async (req, res) => {
	var per_page = parseInt(req.params.per_page) || 5;
	var page_no = parseInt(req.params.page_no) || 0;
	var pagination = {
		limit: per_page,
		skip: per_page * page_no,
	};

	var today = new Date();
	var a1 = {
		$addFields: {
			today: {
				$dateFromParts: {
					year: { $year: today },
					month: { $month: today },
					day: { $dayOfMonth: today },
				},
			},
			birthdayThisYear: {
				$dateFromParts: {
					year: { $year: today },
					month: { $month: '$dob' },
					day: { $dayOfMonth: '$dob' },
				},
			},
			birthdayNextYear: {
				$dateFromParts: {
					year: { $add: [1, { $year: today }] },
					month: { $month: '$dob' },
					day: { $dayOfMonth: '$dob' },
				},
			},
		},
	};
	var a2 = {
		$addFields: {
			nextBirthday: {
				$cond: [
					{ $gte: ['$birthdayThisYear', '$today'] },
					'$birthdayThisYear',
					'$birthdayNextYear',
				],
			},
		},
	};

	let userId = req.params.userId;
	try {
		await addmemberModal
			.aggregate([
				{ $match: { userId: userId } },
				a1,
				a2,
				{
					$project: {
						daysTillBirthday: {
							$divide: [
								{ $subtract: ['$nextBirthday', '$today'] },
								24 * 60 * 60 * 1000 /* milliseconds in a day */,
							],
						},
						firstName: 1,
						dob: 1,
						studentType: 1,
						lastName: 1,
						primaryPhone: 1,
						current_rank_img: 1,
						program: 1,
						notes: 1,
						dobMonth: {
							$month: '$dob',
						},
					},
				},
				{ $sort: { daysTillBirthday: 1 } },
				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						error: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;

					if (data.length > 0) {
						res.send({
							data: data,
							totalCount: memberdata[0].totalCount[0].count,
							success: true,
						});
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (er) {
		throw new Error(er);
	}
};

exports.allMemberships = async (req, res) => {
	const page = parseFloat(req.params.page_no) || 1;
	const pageSize = parseFloat(req.params.per_page) || 5;
	const skip = (page - 1) * pageSize;

	const date = new Date();
	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
	let { start, end } = dateRangeBuild(firstDayOfMonth, date);
	let userId = req.params.userId;
	try {
		const aggregateData = await BuyMembership.aggregate([
			{ $match: { userId } },
			{
				$project: {
					student_name: 1,
					membership_name: 1,
					membership_type:1,
					expiry_date: {
						$convert: {
							input: '$expiry_date',
							to: 'date',
							onError: 'null',
							onNull: 'null',
						},
					},
					studentId: {
						$last: '$studentInfo',
					},
				},
			},
			{
				$lookup: {
					from: 'members',
					localField: '_id',
					foreignField: 'studentId',
					as: 'student',
				},
			},
			{
				$unwind: '$student',
			},
			{
				$project: {
					membership_name: 1,
					membership_type:1,
					expiry_date: 1,
					student_name:"$student.firstName" ,
					phone: '$student.primaryPhone',
				},
			},
			//
			{
				$match: {
					expiry_date: {
						$gte:start,
						$lt: end,
					},
				},
			},
			{
				$facet: {
					metadata: [{ $count: 'total' }, { $addFields: { page } }],
					data: [{ $skip: skip }, { $limit: pageSize }], // add projection here wish you re-shape the docs
				},
			},
		]);

		let total = 0;
		let data = [];

		if (aggregateData.length > 0) {
			total = aggregateData[0].metadata[0]
				? aggregateData[0].metadata[0].total
				: 0;
			data = aggregateData ? aggregateData[0].data : [];
		}

		res.json({
			total,
			data,
		});
	} catch (er) {
		console.log(er);
		res.send({ total: 0, data: [], er });
	}
};

exports.expiredMembership = async (req, res) => {
	const page = parseFloat(req.params.page_no) || 1;
	const pageSize = parseFloat(req.params.per_page) || 5;
	const skip = (page - 1) * pageSize;

	let userId = req.params.userId;
	try {
		const aggregateData = await BuyMembership.aggregate([
			{ $match: { userId } },
			{
				$project: {
					student_name: 1,
					membership_name: 1,
					membership_type:1,
					expiry_date: {
						$convert: {
							input: '$expiry_date',
							to: 'date',
							onError: 'null',
							onNull: 'null',
						},
					},
					studentId: {
						$last: '$studentInfo',
					},
				},
			},
			{
				$lookup: {
					from: 'members',
					localField: 'studentId',
					foreignField: '_id',
					as: 'student',
				},
			},
			{
				$unwind: '$student',
			},
			{
				$project: {
					membership_name: 1,
					membership_type:1,
					expiry_date: 1,
					studentId: 1,
					student_name:"$student.firstName" ,
					phone: '$student.primaryPhone',
				},
			},

			{
				$facet: {
					metadata: [{ $count: 'total' }, { $addFields: { page } }],
					data: [{ $skip: skip }, { $limit: pageSize }], // add projection here wish you re-shape the docs
				},
			},
		]);

		let total = 0;
		let data = [];

		if (aggregateData.length > 0) {
			total = aggregateData[0].metadata[0]
				? aggregateData[0].metadata[0].total
				: 0;
			data = aggregateData ? aggregateData[0].data : [];
		}

		res.json({
			total,
			data,
		});
	} catch (er) {
		console.log(er);
		res.send({ total: 0, data: [], er });
	}
};

exports.TodayTasks = async (req, res) => {
	try {
		const page = parseFloat(req.params.page_no) || 1;
		const pageSize = parseFloat(req.params.per_page) || 5;
		const skip = (page - 1) * pageSize;

		let date = new Date();
		// today ======================
		let { start, end } = dateRangeBuild(date, date);
		// fetch today =============================================================
		// fetch today =============================================================
		const todayRange = {
			userId: req.params.userId,
			due_date: {
				$gte: start,
				$lt: end,
			},
		};

		const tasks = await MyTask.aggregate([
			{ $match: todayRange },
			{
				$project: {
					name: 1,
					label: 1,
					type: 1,
					due_date: 1,
					status: 1,
				},
			},
			{
				$facet: {
					metadata: [{ $count: 'total' }, { $addFields: { page } }],
					data: [{ $skip: skip }, { $limit: pageSize }], // add projection here wish you re-shape the docs
				},
			},
		]);

		let total = 0;
		let data = [];

		if (tasks.length > 0) {
			total = tasks[0].metadata[0] ? tasks[0].metadata[0].total : 0;
			data = tasks ? tasks[0].data : [];
		}

		res.json({
			total,
			data,
		});
	} catch (err) {
		res.send({
			data: [],
			total: 0,
		});
	}
};

exports.ThisWeekTask = async (req, res) => {
	try {
		const page = parseFloat(req.params.page_no) || 1;
		const pageSize = parseFloat(req.params.per_page) || 5;
		const skip = (page - 1) * pageSize;

		let date = new Date();
		let oneWeekBeforeDate = moment(date).subtract(7, 'days');
		// today ======================
		let { start, end } = dateRangeBuild(oneWeekBeforeDate, date);

		const todayRange = {
			userId: req.params.userId,
			due_date: {
				$gte: start,
				$lt: end,
			},
		};

		const tasks = await MyTask.aggregate([
			{ $match: todayRange },
			{
				$project: {
					name: 1,
					label: 1,
					type: 1,
					due_date: 1,
					status: 1,
				},
			},
			{
				$facet: {
					metadata: [{ $count: 'total' }, { $addFields: { page } }],
					data: [{ $skip: skip }, { $limit: pageSize }], // add projection here wish you re-shape the docs
				},
			},
		]);

		let total = 0;
		let data = [];

		if (tasks.length > 0) {
			total = tasks[0].metadata[0] ? tasks[0].metadata[0].total : 0;
			data = tasks ? tasks[0].data : [];
		}

		res.json({
			total,
			data,
		});
	} catch (err) {
		res.send({
			data: [],
			total: 0,
		});
	}
};

exports.memberByMembershipType = async (req, res) => {
	try {
		const page = parseFloat(req.params.page_no) || 1;
		const pageSize = parseFloat(req.params.per_page) || 5;
		const skip = (page - 1) * pageSize;

		let type = String(req.params.type).toUpperCase();

		const tasks = await BuyMembership.aggregate([
			{ $match: { userId: req.params.userId, membership_type: type } },
			{
				$project: {
					student_name: 1,
					membership_type: 1,
					rank: '',
					status: '',
					lastStripe: '',
				},
			},
			{
				$facet: {
					metadata: [{ $count: 'total' }, { $addFields: { page } }],
					data: [{ $skip: skip }, { $limit: pageSize }], // add projection here wish you re-shape the docs
				},
			},
		]);

		let total = 0;
		let data = [];
		if (tasks.length > 0) {
			total = tasks[0].metadata[0] ? tasks[0].metadata[0].total : 0;
			data = tasks ? tasks[0].data : [];
		}

		res.json({
			total,
			data,
		});
	} catch (err) {
		res.send({
			data: [],
			total: 0,
		});
	}
};

