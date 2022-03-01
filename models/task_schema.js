const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const taskSchema = schema(
	{
		type: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
			enum: ['personal', 'mymember'],
		},
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
		},
		label: {
			type: String,
		},
		due_date: {
			type: Date,
		},
		priority: {
			type: Number,
		},
		status: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
		},
		userId: {
			type: String,
		},
	},
	{ timestamps: true }
);
taskSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Tasks', taskSchema);
