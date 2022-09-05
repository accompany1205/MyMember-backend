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
			index:true
		},
		program_color: {
			type: String,
		},
		class_name: {
			type: String,
			required: true,
			index:true
		},
		series_id: {
			type: ObjectId,
			required: true
		},
		isActive: {
			type: Boolean,
			default: true,
			index:true
		},
		start_date: {
			type: String,
			required: true,
			index:true
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
			index:true
		},
		class_attendanceArray: {
			type: Array,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Class_schedule', scheduleSchema);
