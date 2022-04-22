const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const taskSchema = schema(
	{
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: ['One Time', 'Ongoing'],
		},
		interval: {
			type: String
		},
		range: {
			type: String
		},
		start: {
			type: String,
			required: true
		},
		end: {
			type: String,
			required: true
		},
		start_time: {
			type: String,
			required: true
		},
		end_time: {
			type: String,
			required: true
		},
		repeatedDates: {
			type: Array
		},
		repeatedConcurrence: {
			type: String
		},
		label: {
			type: String,
			enum: ['Event', 'Office', 'Home', 'Personal']
		},
		due_date: {
			type: Date,
		},
		priority: {
			type: String,
			enum: ['Clear', 'Low', 'Normal', 'High', 'Urgent']
		},
		isproof: {
			type: Boolean,
		},
		document: {
			type: Array,
		},
		isEnterData: {
			type: Boolean,
		},
		description: {
			type: String,
		},
		isRating: {
			type: Boolean,
		},
		rating: {
			type: Number,
		},
		isYesOrNo: {
			type: Boolean,
		},
		yesOrNo: {
			type: String,
			enum: ["Yes", "No"]
		},
		status: {
			type: String,
			required: true,
			enum: ['Due', 'Completed', 'Past Due', 'Pending']
		},
		userId: {
			type: String,
		},
		subfolderId: {
			type: String,
		},
	},
	{ timestamps: true }
);
taskSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Task', taskSchema);