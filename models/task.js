const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const taskSchema = schema(
	{
		name: {
			type: String,
			required: true,
		},
		assign: {
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
			required: true,
			index: true
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
			type: Date,
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
		isApprove:{
			type:Boolean,
			default: false
		},
		isSubmit:{
			type:Boolean,
			default: false
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
			index: true
		},
		subfolderId: {
			type: String,
			ref: "tasksubfolder",
		},
		isSeen:{
			type: Boolean,
			default: false,
			index: true
		},
		isRead:{
			type: Boolean,
			default: false,
			index: true
		} 
	},
	{ timestamps: true }
);
taskSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Task', taskSchema);
