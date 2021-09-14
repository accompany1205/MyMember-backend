const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Finance_infoSchema = new schema(
	{
		card_type: {
			type: String,
			required: true,
		},
		holder_name: {
			type: String,
			required: true,
		},
		notes: {
			type: String,
		},
		default: {
			type: Number,
			default: 0,
		},
		status: {
			type: String,
			required: true,
		},
		credit_Card_type: {
			type: String,
			required: true,
		},
		credit_Card_Number: {
			type: String,
			required: true,
		},
		credit_cvv: {
			type: String,
			required: true,
		},
		cardExpiry: {
			type: Date,
			require: true,
		},
		expiry_month: {
			type: Number,
			required: true,
		},
		expiry_year: {
			type: Number,
			required: true,
		},
		billing_address: {
			type: String,
		},
		country: {
			type: String,
		},
		state: {
			type: String,
		},
		city: {
			type: String,
		},
		zip_postal: {
			type: String,
		},
		studentId: {
			type: schema.Types.ObjectId,
			ref: "member",
		},
		userId: {
			type: schema.Types.ObjectId,
			ref: "user",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("FinanceInfo", Finance_infoSchema);
