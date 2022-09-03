const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productSchema = new schema(
	{
		product_name: {
			type: String,
			required: true,
		},
		product_type: {
			type: String,
			required: true,
		},
		product_description: {
			type: String,
			required: true,
		},
		event_date: {
			type: String,
			required: true,
		},
		next_payment_date: {
			type: String,
		},
		start_payment_date: {
			type: String,
		},
		expiry_date: {
			type: String,
		},
		// programName: {
		//     type: String,
		//     required: true
		// },
		total_price: {
			type: Number,
			required: true,
		},
		deposite: {
			type: Number,
			required: true,
		},
		balance: {
			type: Number,
			required: true,
		},
		payment_type: {
			//weekly/monthly
			type: String,
			required: true,
		},
		isEMI: {
			type: Boolean,
			required: true,
		},
		ptype: {
			//cash/cheque
			type: String,
			required: true,
		},
		payment_time: {
			//number of EMIs
			type: Number,
			required: true,
		},
		due_status: {
			type: String,
			default: 'due',
			enum: ['paid', 'due', 'over_due'],
		},
		due_every: {
			type: String,
		},
		schedulePayments: {
			type: Array,
			requred: true,
		},
		refund: {
			type: Array,
		},
		isRefund: {
			type: Boolean,
			default: false,
		},
		pay_inout: {
			type: String,
			required: true,
		},
		pay_latter: {
			type: String,
		},
		createdBy: {
			type: String,
			required: true,
		},
		transactionId: {
			type: Object,
		},
		subscription_id: {
			type: String,
		},
		cheque_no: {
			type: String,
		},
		student_name: {
			type: String,
		},
		mergedDoc: {
			type: String,
		},
		studentInfo: [
			{
				type: schema.Types.ObjectId,
				ref: 'member',
				required: true,
			},
		],
		userId: {
			type: String,
			required: true,
			index:true
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Buy_Product', productSchema);
