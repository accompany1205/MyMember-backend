const axios = require("axios");
const FormData = require("form-data");

class PaymentGateWay {
  formData = async (payload) => {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
    formData.append("auth_token", process.env.AUTH_TOKEN);
    formData.append("app_id", "hN0X2aFHUIoGbUbkzVZqq3MBE3J3USaM");
    formData.append("auth_key", "xwSilkDfrwdYBSF61tn4XEoMKJNaoCin");
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
      formData.append("epi", "2129909286");
      formData.append("mtype", "addsubscription");

      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  saleSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("epi", "2129909286");
      formData.append("mtype", "0200");

      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
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

  deleteSubscription = async () => {
    try {
      let formData = await this.formData(payload);
      formData.append("epi", "2129909286");
      formData.append("mtype", "deletesubscription");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  freezeSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("epi", "2129909286");
      formData.append("mtype", "freezesubscription");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  unfreezeSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("epi", "2129909286");
      formData.append("mtype", "unfreezesubscription");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw new Error(ex);
    }
  };

  refundSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("epi", "2129909286");
      formData.append("mtype", "refund");
      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeader(formData));
    } catch (ex) {
      throw Error(ex);
    }
  };
  forfeitSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("epi", "2129909286");
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
