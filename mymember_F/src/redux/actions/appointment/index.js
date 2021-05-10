import axios from "axios";
const baseUrl = process.env.REACT_APP_BASE_URL;

export const FETCH_EVENTS = () => {
  return async (dispatch) => {
    try {
      let response = await axios.get(
        `${baseUrl}/api/appointment/list_of_appointments/${localStorage.getItem(
          "user_id"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (response.data && response.status === 200) {
        dispatch({
          type: "FETCH_EVENTS",
          events: response.data,
        });
      }
    } catch (error) {
      console.log("something went wrong");
    }
  };
};

export const ADD_APPOINTMENT = (appointment) => {
  return async (dispatch) => {
    try {
      let response = await axios.post(
        `${baseUrl}/api/add_appointment/${localStorage.getItem("user_id")}`,
        appointment,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.data && response.status === 200) {
        dispatch({
          type: "ADD_APPOINTMENT",
          event: response.data,
        });

        dispatch(FETCH_EVENTS());
      }
    } catch (error) {
      console.log(error);
      console.log("something went wrong");
    }
  };
};

export const UPDATE_APPOINTMENT = (appointment, appointmentId) => {
  return async (dispatch) => {
    try {
      let response = await axios.put(
        `${baseUrl}/api/appointment/update_appointment/${localStorage.getItem("user_id")}/${appointmentId}`,
        appointment,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.data && response.status === 200) {
        dispatch({
          type: "UPDATE_APPOINTMENT",
          event: response.data,
        });

        dispatch(FETCH_EVENTS());
      }
    } catch (error) {
      console.log(error);
      console.log("something went wrong");
    }
  };
};

export const APPOINTMENT_REMOVE = (appointmentId) => {
  return async (dispatch) => {
    try {
      let response = await axios.delete(
        `${baseUrl}/api/delete_appointment/${localStorage.getItem(
          "user_id"
        )}/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (response.data && response.status === 200) {
        dispatch({
          type: "APPOINTMENT_REMOVE",
          event: response.data,
        });

        dispatch(FETCH_EVENTS());
      }
    } catch (error) {
      console.log("something went wrong in fetching class student");
    }
  };
};