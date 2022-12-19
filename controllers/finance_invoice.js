const Finance_invoiceSchema = require("../models/finance_invoice");

exports.getInvoices = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await Finance_invoiceSchema.find({ userId });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};

exports.getInvoiceById = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const data = await Finance_invoiceSchema.findOne({ _id: invoiceId });
    if(data) {
      res.status(200).json(data);
    } else if (data === null) {
      res.status(404).json({ success: false, message: 'Invoice not found' })
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};

exports.createInvoice = async (req, res) => {
  const { userId } = req.params;
  const payload = { ...req.body, userId };
  try {
    const data = await Finance_invoiceSchema.create(payload);
    if(data._id) {
      res.status(200).json({ success: true, message: "Invoice created successfully!" });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
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
    if(data) {
      res.status(200).json(data);
    } else if (data === null) {
      res.status(404).json({ success: false, message: 'Invoice not found' })
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};

exports.deleteInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const del = await Finance_invoiceSchema.deleteOne({ _id: invoiceId });
    if (del.deletedCount > 0) {
      res.send({ success: true, message: "success" });
    } else {
      res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
