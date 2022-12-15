const Finance_invoiceSchema = require('../models/finance_invoice');
exports.getInvoices = async (req, res) => {
    const { userId } = req.params;
    try {
        const data = await Finance_invoiceSchema.find({ userId });
        res.status(200).json(data);
    } catch(err) {
        res.status(400).json({
            status: false,
            message: err.message || "Something went wrong"
        });
    }
};

exports.createInvoice = async (req, res) => {
    const { userId } = req.params;
    const payload = { ...req.body, userId };
    try {
        const data = await Finance_invoiceSchema.create(payload);
        res.send(data);
    } catch(err) {
        res.status(400).json({
            status: false,
            message: err.message || "Something went wrong"
        });
    }
};