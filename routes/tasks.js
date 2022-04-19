const express = require('express');
const Router = express.Router();
const fs = require('fs');
const model = require('../models/task');
const moment = require('moment');

const STATUS_DICT = {
	1: 'Pending',
	2: 'In Progress',
	3: 'Completed',
	5: 'Not completed',
};

const Priority_DICT = {
	1: 'Low',
	2: 'Normal',
	3: 'Hight',
	4: 'Urgent',
};

class Tasks {
	constructor() {
		Router.get('/tasks/:id?', this.Get);
		Router.post('/tasks', this.Post);
		Router.put('/tasks/:id', this.Put);
		Router.delete('/tasks/:id', this.delete);
	}

	// Get method
	Get = async (req, res) => {
		try {
			const { id } = req.params;
			const input = req.query;
			let conditions = {};
			if (id) {
				model.findById(id, function (err, item) {
					return res.status(200).json({ message: 'ok', data: item });
				});
			} else {
				const {
					type = null,
					name = null,
					label = null,
					time = null,
					priority = null,
					status = null,
					withStats = null,
					page = 1,
					page_size = 20,
				} = req.query;
				if (type) {
					conditions.type = type;
				}
				if (name) {
					conditions.name = { $regex: name, $options: 'i' };
				}

				if (label) {
					conditions.name = { $regex: name, $options: 'i' };
				}
				if (priority) {
					conditions.priority = priority;
				}
				if (status) {
					conditions.status = status;
				}

				if (time) {
					switch (time) {
						case 'today':
							conditions.due_date = {
								$gte: moment().add('-1', 'days').toISOString(),
							};
							break;
						case 'tommorow':
							conditions.due_date = {
								$gte: moment().add('1', 'days').toISOString(),
							};
							break;
						case 'upcoming':
							conditions.due_date = { $gte: moment().toISOString() };
							break;
						case 'week':
							conditions.due_date = {
								$gte: moment().add('-1', 'weeks').toISOString(),
							};
							break;
						case 'month':
							conditions.due_date = {
								$gte: moment().add('-1', 'months').toISOString(),
							};
							break;
						case 'year':
							conditions.due_date = {
								$gte: moment().add('-1', 'years').toISOString(),
							};
							break;
						default:
							break;
					}
				}

				model.paginate(
					conditions,
					{ page, limit: page_size },
					async function (err, items) {
						if (withStats) {
							let data = items;

							const today_count = await model.countDocuments({
								due_date: { $gte: moment().add('-1', 'days').toISOString() },
							});
							const today_complete = await model.countDocuments({
								due_date: { $gte: moment().add('-1', 'days').toISOString() },
								status: 3,
							});
							const today_total_complete_percent = parseFloat(
								(today_complete / today_count) * 100
							).toFixed(2);

							const week_count = await model.countDocuments({
								due_date: { $gte: moment().add('-1', 'weeks').toISOString() },
							});
							const week_complete = await model.countDocuments({
								due_date: { $gte: moment().add('-1', 'weeks').toISOString() },
								status: 3,
							});
							const week_total_complete_percent = parseFloat(
								(week_complete / week_count) * 100
							).toFixed(2);

							const month_count = await model.countDocuments({
								due_date: { $gte: moment().add('-1', 'months').toISOString() },
							});
							const month_complete = await model.countDocuments({
								due_date: { $gte: moment().add('-1', 'months').toISOString() },
								status: 3,
							});
							const month_total_complete_percent = parseFloat(
								(month_complete / month_count) * 100
							).toFixed(2);

							const year_count = await model.countDocuments({
								due_date: { $gte: moment().add('-1', 'years').toISOString() },
							});
							const year_complete = await model.countDocuments({
								due_date: { $gte: moment().add('-1', 'years').toISOString() },
								status: 3,
							});
							const year_total_complete_percent = parseFloat(
								(year_complete / year_count) * 100
							).toFixed(2);
							data.stats = {};
							data.stats.today_complete = +today_total_complete_percent || 0;
							data.stats.week_complete = +week_total_complete_percent || 0;
							data.stats.month_complete = +month_total_complete_percent || 0;
							data.stats.year_complete = +year_total_complete_percent || 0;
							return res.status(200).json({ message: 'ok', data: data });
						} else {
							return res.status(200).json({ message: 'ok', data: items });
						}
					}
				);
			}
		} catch (err) {
			return res.status(400).json({ message: err });
		}
	};

	Post = async (req, res) => {
		try {
			const input = req.body;
			const item = new model(input);
			item.save((err, data) => {
				// console.log(data);

				if (err) {
					return res.status(400).json({ message: err });
				} else {
					return res
						.status(200)
						.json({ message: 'item add successfuly', data: data });
				}
			});
		} catch (err) {}
	};

	Put = async (req, res) => {
		try {
			const { id } = req.params;
			const input = req.body;
			if (id) {
				model.findByIdAndUpdate(id, input, {}, (err, data) => {
					if (err) {
						return res.status(400).json({ message: err });
					}
					return res
						.status(200)
						.json({ message: 'item updated successfuly', data: data.id });
				});
			} else {
				return res.status(400).json({ message: 'id is required' });
			}
		} catch (err) {
			return res.status(500).json({ message: err });
		}
	};

	delete = async (req, res) => {
		try {
			const { id } = req.params;
			const input = req.body;
			if (id) {
				model.findOneAndDelete({ _id: id }, {}, (err, data) => {
					if (err) {
						return res.status(400).json({ message: err });
					}
					return res
						.status(200)
						.json({ message: 'item remove successfuly', data });
				});
			} else {
				return res.status(400).json({ message: 'id is required' });
			}
		} catch (err) {}
	};
}
new Tasks();
module.exports = Router;
