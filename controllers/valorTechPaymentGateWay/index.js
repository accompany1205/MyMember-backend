const axios = require("axios");
class PaymentGateWay {
  formData = (payload) => {
    var formData = new FormData();
    let dataEntries = Object.entries(payload);
    dataEntries.map((v, i) => {
      formData.append(v[0], v[1]);
    });
    formData.append("auth_token", process.env.AUTH_TOKEN);
    formData.append("app_id", "hN0X2aFHUIoGbUbkzVZqq3MBE3J3USaM");
    formData.append("auth_key", "xwSilkDfrwdYBSF61tn4XEoMKJNaoCin");
    return formData;
  };

  addSubscription = async (payload) => {
    let formData = await formData(payload);
    formData.append("epi", "2129909286");
    formData.append("mtype", "addsubscription");
    const res = await axios.post(process.env.VALOR_PAYTECH_URL, formData);
    return res;
  };

  editSubscription = async (payload) => {
    let formData = await formData(payload);
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
