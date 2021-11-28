const axios = require("axios");
const FormData = require('form-data')
class PaymentGateWay {

  formData = async (payload) => {
    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    formData.append("auth_token", process.env.AUTH_TOKEN);
    formData.append("app_id", "hN0X2aFHUIoGbUbkzVZqq3MBE3J3USaM");
    formData.append("auth_key", "xwSilkDfrwdYBSF61tn4XEoMKJNaoCin");
    return formData;
  };

  getHeadersForSubscription = (formData) => {
    return {
      headers: {
        'Accept': '*/*',
        'Cookie': 'HttpOnly',
        ...formData.getHeaders()
      },
    }

  }
  addSubscription = async (payload) => {
    try {
      let formData = await this.formData(payload);
      formData.append("epi", "2129909286");
      formData.append("mtype", "addsubscription");

      return await axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeadersForSubscription(formData))
      // return new Promise((resolve, reject) => {
      //   axios.post(process.env.VALOR_PAYTECH_URL, formData, this.getHeadersForSubscription(formData))
      //     .then((response) => resolve(response.data))
      //     .catch((error) => {
      //       throw new Error(error)
      //       reject(error);

      //     });
      // })
    }
    catch (Er) {
      throw new Error(Er)
    }
  };

  editSubscription = async (payload) => {
    let formData = await this.formData(payload);
    formData.append("mtype", "editsubscription");
    const res = await axios.post(process.env.VALOR_PAYTECH_URL, formData);
    return res;
  };

  deleteSubscription = async () => {
    let formData = await formData(payload);
    formData.append("epi", "2129909286");
    formData.append("mtype", "deletesubscription");
    const res = await axios.post(process.env.VALOR_PAYTECH_URL, formData);
    return res;
  };

  freezeSubscription = async () => {
    let formData = await formData(payload);
    formData.append("epi", "2129909286");
    formData.append("mtype", "freezesubscription");
    const res = await axios.post(process.env.VALOR_PAYTECH_URL, formData);
    return res;
  };

  unfreezeSubscription = async () => {
    let formData = await formData(payload);
    formData.append("epi", "2129909286");
    formData.append("mtype", "unfreezesubscription");
    const res = await axios.post(process.env.VALOR_PAYTECH_URL, formData);
    return res;
  };

  refund = async () => {
    let formData = await formData(payload);
    formData.append("epi", "2129909286");
    formData.append("mtype", "refund");
    const res = await axios.post(process.env.VALOR_PAYTECH_URL, formData);
    return res;
  };
}

const valorTechPaymentGateWay = new PaymentGateWay();
module.exports = {
  valorTechPaymentGateWay,
};
