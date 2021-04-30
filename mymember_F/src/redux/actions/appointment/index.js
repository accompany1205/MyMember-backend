import axios from "axios";
const baseUrl = process.env.REACT_APP_BASE_URL;

export const ADD_APPOINTMENT = (appoinemnt) => {
  return async (dispatch) => {
    try {
      let response = await axios.post(
        `${baseUrl}/api/add_appointment/${localStorage.getItem("user_id")}`,
        { appoinemnt },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log(response);
      if (response.data && response.status === 200) {
        dispatch({
          type: "ADD_APPOINTMENT",
          event: response.data,
        });
      }
    } catch (error) {
      console.log(error);
      console.log("something went wrong");
    }
  };
};
