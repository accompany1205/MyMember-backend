const mongoose = require('mongoose');

const schema = mongoose.Schema;
let ObjectId = schema.ObjectId;

const scheduleSchema = new schema(
	{
		program_name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
		},
		program_color: {
			type: String,
		},
		class_name: {
			type: String,
			required: true
		},
		series_id: {
			type: ObjectId,
			required: true
		},
		isActive: {
			type: Boolean,
			default: true
		},
		start_date: {
			type: String,
			required: true,
		},
		end_date: {
			type: String,
			required: true,
		},
		start_time: {
			type: String,
			required: true,
		},
		end_time: {
			type: String,
			required: true,
		},
		wholeSeriesEndDate: {
			type: String,
			required: true,
		},
		wholeSeriesStartDate: {
			type: String,
			required: true,
		},
		repeat_weekly_on: {
			type: Array
		},
		userId: {
			type: String,
		},
		class_attendanceArray: {
			type: Array,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Class_schedule', scheduleSchema);
