const tempList = require('../models/std_temp_list');
// const async = require('async');
const program = require('../models/program');
const program_rank = require('../models/program_rank');
const Member = require('../models/addmember');
const { dateRangeBuild } = require('./../utilities/dateRangeProcess');
const mongoose = require('mongoose');
exports.getAllProgram = async (req, res) => {
	try {
		const adminId = process.env.ADMINID; // fix adminid
		const userId = req.params.userId;
		const data = await program
			.find({ $or: [{ userId: userId }, { adminId: adminId }] })
			.select('_id color programName');

		return res.json(data);
	} catch (err) {
		res.send(500).json({ message: 'Data not Found' });
	}
};

exports.getStateByType = async (req, res) => {
	const { programId, label } = req.query;
	const userId = req.params.userId;

	let dateRange;
	let date = new Date();

	if (label === 'TODAY') {
		const { start, end } = dateRangeBuild(date, date);
		dateRange = {
			userId,
			createdAt: {
				$gte: start,
				$lt: end,
			},
		};
	}

	if (label === 'THIS_MONTH') {
		let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
		const { start, end } = dateRangeBuild(firstDayOfMonth, date);
		dateRange = {
			userId,
			createdAt: {
				$gte: start,
				$lt: end,
			},
		};
	}

	if (label === 'LAST_MONTH') {
		date.setMonth(date.getMonth() - 1);
		let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
		let lastDayOfMonth = new Date(date.getFullYear(), new Date().getMonth(), 0);
		const { start, end } = dateRangeBuild(firstDayOfMonth, lastDayOfMonth);
		dateRange = {
			userId,
			createdAt: {
				$gte: start,
				$lt: end,
			},
		};
	}

	if (label === 'LAST_3_MONTH') {
		date.setMonth(date.getMonth() - 2);
		let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
		const { start, end } = dateRangeBuild(firstDayOfMonth, new Date());
		dateRange = {
			userId,
			createdAt: {
				$gte: start,
				$lt: end,
			},
		};
	}

	try {
		const countTotal = await Member.find({
			...dateRange,
			programID: programId,
		}).countDocuments();

		return res.send(countTotal + '');
	} catch (err) {
		res.send(500).json({ message: 'Data not Found' });
	}
};

exports.statisticsFilter = async (req, res) => {
	const userId = req.params.userId;
	let date = req.body.dates;
	//let newMonth = date.slice(0, 2)
	let newDate = date.slice(3, 5)
	let newYear = date.slice(-4);
	let updateY = ("" + (parseInt(newYear) + 1))
	let finalDate;
	//let updateM = ("0" + (parseInt(newMonth) + 1)).slice(-2);
	try {
		let count = 1;
		let promises = [];
		while (count <= 12) {
			let month = ("0" + count).slice(-2);
			finalDate = `${month}-${newDate}-${updateY}`;
			date = `${month}-${newDate}-${newYear}`
			let dataObj = {
				month: 0,
				join: 0,
				quite: 0
			};
			let join = await Member.find(
				{
					$and: [
						{ userId: userId },
						{ studentType: "Active Trial" },
						{ createdAt: { $gte: (date), $lt: (finalDate) } }
					]
				}
			);
			let quite = await Member.find(
				{
					$and: [
						{ userId: userId },
						{ studentType: "Former Trial" },
						{ createdAt: { $gte: (date), $lt: (finalDate) } }
					]
				}
			);

			dataObj.month = count;
			dataObj.join = join.length;
			dataObj.quite = quite.length;
			promises.push(dataObj);
			count += 1;
		}
		// let responseData = await Promise.all(promises);

		if (promises.length == 0) {
			return res.send({ msg: "no data!", success: false })
		}
		return res.send({ msg: "data", success: true, data: promises });

	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ""), success: false })
	}
}

exports.statisticsFilterMember = async (req, res) => {
	const userId = req.params.userId;
	let date = req.body.dates;
	//let newMonth = date.slice(0, 2)
	let newDate = date.slice(3, 5)
	let newYear = date.slice(-4);
	let updateY = ("" + (parseInt(newYear) + 1))
	let finalDate;
	//let updateM = ("0" + (parseInt(newMonth) + 1)).slice(-2);
	try {
		let count = 1;
		let promises = [];
		while (count <= 12) {
			let month = ("0" + count).slice(-2);
			finalDate = `${month}-${newDate}-${updateY}`;
			date = `${month}-${newDate}-${newYear}`
			let dataObj = {
				month: 0,
				join: 0,
				quite: 0
			};
			let join = await Member.find(
				{
					$and: [
						{ userId: userId },
						{ studentType: "Active Student" },
						{ createdAt: { $gte: (date), $lt: (finalDate) } }
					]
				}
			);
			let quite = await Member.find(
				{
					$and: [
						{ userId: userId },
						{ studentType: "Former Student" },
						{ createdAt: { $gte: (date), $lt: (finalDate) } }
					]
				}
			);

			dataObj.month = count;
			dataObj.join = join.length;
			dataObj.quite = quite.length;
			promises.push(dataObj);
			count += 1;
		}
		// let responseData = await Promise.all(promises);

		if (promises.length == 0) {
			return res.send({ msg: "no data!", success: false })
		}
		return res.send({ msg: "data", success: true, data: promises });

	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ""), success: false })
	}
}

exports.getJoinDataByYear = async (req, res) => {
	const { programId } = req.query;
	const userId = req.params.userId;

	let { year } = req.query;
	year = isNaN(parseInt(year)) ? new Date().getFullYear() : parseInt(year);

	try {
		const memnerData = await Member.aggregate([
			{ $match: { userId, programID: programId } },
			{
				$project: {
					createdAt: 1,
					year: { $year: '$createdAt' },
					month: { $month: '$createdAt' },
				},
			},
			{
				$match: { year },
			},

			{
				$group: {
					_id: '$month',
					join: {
						$sum: 1,
					},
				},
			},
		]);

		const quiteData = await Member.aggregate([
			{ $match: { userId, programID: programId } },
			{
				$project: {
					updatedAt: 1,
					year: { $year: '$updatedAt' },
					month: { $month: '$updatedAt' },
					quit: {
						$cond: [{ $eq: ['$studentType', 'Former Student'] }, 1, 0],
					},
				},
			},
			{
				$match: { year },
			},

			{
				$group: {
					_id: '$month',
					quit: {
						$sum: '$quit',
					},
				},
			},
		]);

		var month = [
			{ name: 'January', index: 1 },
			{ name: 'February', index: 2 },
			{ name: 'March', index: 3 },
			{ name: 'April', index: 4 },
			{ name: 'May', index: 5 },
			{ name: 'June', index: 6 },
			{ name: 'July', index: 7 },
			{ name: 'August', index: 8 },
			{ name: 'September', index: 9 },
			{ name: 'October', index: 10 },
			{ name: 'November', index: 11 },
			{ name: 'December', index: 12 },
		];

		const statictics = month.map((m) => {
			const find =
				memnerData &&
				memnerData.length > 0 &&
				memnerData.find((x) => x._id == m.index);

			const quiteFind =
				quiteData &&
				quiteData.length > 0 &&
				quiteData.find((x) => x._id == m.index);

			return {
				join: find ? find.join : 0,
				quit: quiteFind ? quiteFind.quit : 0,
				month: m.name,
			};
		});

		return res.json(statictics);
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: 'Data not Found' });
	}
};

exports.getRanksByProgram = async (req, res) => {
	try {
		const { programID } = req.query;
		if (programID === '') {
			return res.json([]);
		}
		const pgrm = await program.findById(programID);
		if (!pgrm) {
			return res.json([]);
		}
		const data = await program_rank
			.find({ programName: pgrm.programName })
			.select('rank_name');
		return res.json(data);
	} catch (err) {
		return res.status(500).json({ message: 'Data not Found' });
	}
};

exports.getMemberByProgram = async (req, res) => {
	try {
		const userId = req.params.userId;
		let { programID, page, perPage, rank, year, month } = req.query;
		page = parseFloat(page) || 1;
		pageSize = parseFloat(perPage) || 10;
		const skip = (page - 1) * pageSize;
		month = parseInt(month) || new Date().getMonth() + 1;
		year = parseInt(year) || new Date().getFullYear();
		let query = { userId, programID };

		if (rank !== '') {
			query = {
				...query,
				current_rank_name: rank,
			};
		}

		const memberList = await Member.aggregate([
			{ $match: query },
			{
				$project: {
					month: {
						$month: '$createdAt',
					},
					year: {
						$year: '$createdAt',
					},
					createdAt: 1,
					current_rank_name: 1,
					firstName: 1,
					lastName: 1,
					current_rank_id: 1,
				},
			},
			{
				$match: { month, year },
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
		if (memberList.length > 0) {
			total = memberList[0].metadata[0] ? memberList[0].metadata[0].total : 0;
			data = memberList ? memberList[0].data : [];
		}
		res.json({
			total,
			data,
		});
	} catch (err) {
		return res.status(500).json({ message: 'Data not Found' });
	}
};

exports.getRanksReportByProgram = async (req, res) => {
	try {
		let { programID } = req.query;
		const userId = req.params.userId;
		if (program === '') {
			return res.json([]);
		}

		const ranks = await program.aggregate([
			{
				$match: {
					_id: mongoose.Types.ObjectId(programID),
				},
			},
			{ $unwind: '$program_rank' },
			{
				$lookup: {
					from: 'program_ranks',
					localField: 'program_rank',
					foreignField: '_id',
					as: 'program',
				},
			},
			{
				$unwind: '$program',
			},
			{
				$project: {
					programName: 1,
					rank_name: '$program.rank_name',
					rank_image: '$program.rank_image',
					rank_order: '$program.rank_order',
				},
			},
			// Get Current Month Data
			{
				$lookup: {
					from: 'student_info_ranks',
					localField: 'rank_name',
					foreignField: 'rank_name',
					as: 'total-students',
					pipeline: [
						{
							$project: {
								userId: "$userId",
								// month: { $month: '$createdAt' },
								// year: { $year: '$createdAt' },
							},
						},
						{
							$match: {
								// month,
								// year,
								userId
							},
						},
						{
							'$group': {
								'_id': '$current_rank_name',
								'total': {
									'$sum': 1
								}
							}
						},
						{
							$project: {
								total: 1,
								_id: 0
		
							},
						},
					],
				},
			},

			// Get Last Month Date
			// {
			// 	$lookup: {
			// 		from: 'student_info_ranks',
			// 		localField: 'rank_name',
			// 		foreignField: 'rank_name',
			// 		as: 'last-month',
			// 		pipeline: [
			// 			{
			// 				$project: {
			// 					userId: "$userId",
			// 					// lastMonth: { $month: '$createdAt' },
			// 					// lastYear: { $year: '$createdAt' },
			// 				},
			// 			},
			// 			{
			// 				$match: {
			// 					// lastMonth,
			// 					// lastYear,
			// 					userId
			// 				},
			// 			},
			// 			{
			// 				$count: 'total',
			// 			},
			// 		],
			// 	},
			// },

			// Lets Map the Data
			{
				$project: {
					programName: 1,
					rank_name: 1,
					rank_image: 1,
					rank_order: 1,
					total_students: { $arrayElemAt: ['$total-students', 0] },
					// last_month: { $arrayElemAt: ['$last-month', 0] },
				},
			},
			{ $sort: { programName: 1 } }
			// Ranks
		]);

		// const ranks = await Member.aggregate(
		// 	[
		// 		{
		// 			'$match': {
		// 				'program': program,
		// 				'userId': userId
		// 			}
		// 		}, {
		// 			'$group': {
		// 				'_id': '$current_rank_name',
		// 				'programName': {
		// 					'$first': '$program'
		// 				},
		// 				'rank_name': {
		// 					'$first': '$current_rank_name'
		// 				},
		// 				'rank_image': {
		// 					'$first': '$current_rank_img'
		// 				},
		// 				'rank_order': {
		// 					'$first': '$rank_order'
		// 				},
		// 				'total': {
		// 					'$sum': 1
		// 				}
		// 			}
		// 		}, {
		// 			'$sort': {
		// 				'rank_order': 1
		// 			}
		// 		}, {
		// 			'$project': {
		// 				'rank_name': '$_id',
		// 				'programName': 1,
		// 				'rank_name': 1,
		// 				'rank_image': 1,
		// 				'rank_order': 1,
		// 				'total': 1,
		// 				'_id': 0
		// 			}
		// 		}
		// 	]
		// )

		return res.json(ranks);
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: 'Data not Found' });
	}
};
