const Finance_invoiceSchema = require("../models/finance_invoice");
exports.getInvoices = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await Finance_invoiceSchema.find({ userId });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message || "Something went wrong"
    });
  }
};

exports.getInvoiceById = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const data = await Finance_invoiceSchema.findOne({ _id: invoiceId });
    res.status(200).json(data);
  } catch (err) {
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
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message || "Something went wrong"
    });
  }
};

exports.updateInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const payload = req.body;
  try {
    const data = await Finance_invoiceSchema.findOneAndUpdate({ _id: invoiceId }, payload, {
      new: true
    });
    res.send(data);
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message || "Something went wrong"
    });
  }
};

exports.deleteInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const del = await Finance_invoiceSchema.deleteOne({ _id: invoiceId });
    if (del.deletedCount > 0) {
      res.send({ status: true, message: "success" });
    } else {
      res.status(404).json({
        status: false,
        message: "Invoice not found"
      });
    }
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err.message
    });
  }
};
