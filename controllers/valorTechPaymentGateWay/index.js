const axios = require("axios");
const FormData = require("form-data");

class PaymentGateWay {
  formData = async (payload) => {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
    formData.append("auth_token", process.env.AUTH_TOKEN);
    formData.append("surchargeIndicator", 1)
    formData.append("avs", 1)
    return formData;
  };

  getHeader = (formData) => {
    return {
      headers: {
        Accept: "*/*",
        Cookie: "HttpOnly",
        ...formData.getHeaders(),
      },
    };
  };

  addSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("mtype", "addsubscription");

      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  saleSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("mtype", "0200");

      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };
  securePayLink = async (payload) => {
    try {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
      formData.append("redirect_url", process.env.REDIRECT_URL);
      formData.append("txn_type", "sale");
      formData.append("surcharge", "37.50");
      formData.append("epage", "1");
      formData.append("tax", "3.00");

      return await axios.post(process.env.VALOR_EPAGE_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  epageCustomTransaction = async (payload) => {
    try {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
      return await axios.post(process.env.VALOR_EPAGE_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };
  editSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("mtype", "editsubscription");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  deleteSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("mtype", "deletesubscription");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  freezeSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("mtype", "freezesubscription");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  unfreezeSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("mtype", "unfreezesubscription");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  refundSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("mtype", "refund");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw Error(ex);
    }
  };
  forfeitSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("mtype", "forfeitsubscription");
      formData.append("flag", 1)
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw Error(ex)
    }
  }
}

const valorTechPaymentGateWay = new PaymentGateWay();
module.exports = {
  valorTechPaymentGateWay,
};
