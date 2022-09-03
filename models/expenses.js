const mongoose = require('mongoose');
const schema = mongoose.Schema;

const expenseSchema = new schema(
	{
		amount: {
			type: Number,
			required: true,
		},
		subject: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		expenses: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		expense_image: {
			type: String,
		},
		date: {
			type: Date,
			required: true,
			index: true
		},
		dateM: {
			type: String,
			index: true
		},
		userId: {
			type: schema.Types.ObjectId,
			index: true
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
