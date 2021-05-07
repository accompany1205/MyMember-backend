import axios from "axios";
const baseUrl = process.env.REACT_APP_BASE_URL;

// export const fetchEvents = () => {
//   return async dispatch => {
//     await axios
//       .get("/api/apps/calendar/events")
//       .then(response => {
//         dispatch({ type: "FETCH_EVENTS", events: response.data })
//       })
//       .catch(err => console.log(err))
//   }
// }
export const fetchEvents = () => {
  return async (dispatch) => {
    try {
      let response = await axios.get(
        `${baseUrl}/api/list_of_classSchedule/${localStorage.getItem(
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

export const ATTENDENCE_STUDENTS_REMOVE = (attendenceId, scheduleId) => {
  return async (dispatch) => {
    try {
      let response = await axios.delete(
        `${baseUrl}/api/attendence/remove_attendence/${localStorage.getItem(
          "user_id"
        )}/${attendenceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (response.data && response.status === 200) {
        dispatch({
          type: "ATTENDENCE_STUDENTS_REMOVE",
          event: response.data,
        });

        if (scheduleId) {
          dispatch(FETCH_CLASS_STUDENTS(scheduleId));
        }

        dispatch(FETCH_ATTENDEE_LIST);
      }
    } catch (error) {
      console.log("something went wrong in fetching class student");
    }
  };
};

export const FETCH_CLASS_STUDENTS = (scheduleId) => {
  return async (dispatch) => {
    try {
      let response = await axios.get(
        `${baseUrl}/api/class_schedule_by_id/${localStorage.getItem(
          "user_id"
        )}/${scheduleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log(response);
      if (response.data && response.status === 200) {
        dispatch({
          type: "FETCH_CLASS_STUDENTS",
          event: response.data,
        });
      }
    } catch (error) {
      console.log("something went wrong in fetching class student");
    }
  };
};

export const FETCH_ATTENDEE_LIST = () => {
  return async (dispatch) => {
    try {
      let response = await axios.get(
        `${baseUrl}/api/attendence/attendence_list/${localStorage.getItem(
          "user_id"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("to fetch attendance list", response);
      if (response.data && response.status === 200) {
        dispatch({
          type: "FETCH_ATTENDEE_LIST",
          event: response.data,
        });
      }
    } catch (error) {
      console.log("something went wrong");
    }
  };
};

export const STUD_GET = () => {
  return async (dispatch) => {
    try {
      let response = await axios.get(
        `${baseUrl}/api/member/member_list/${localStorage.getItem("user_id")}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      // console.log("to fetch students", response.data);
      // console.log("to fetch students", response.data, response.status);
      if (response.data && response.status === 200) {
        dispatch({
          type: "STUD_GET",
          event: response.data,
        });
      }
    } catch (error) {
      console.log("something went wrong in student fetching");
    }
  };
};

export const ADD_STUDENT_TO_CLASS = (scheduleId, id, time) => {
  return async (dispatch) => {
    try {
      let response = await axios.post(
        `${baseUrl}/api/attendence/create_attendence/${localStorage.getItem(
          "user_id"
        )}/${scheduleId}/${id}`,
        { time },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log(response, "<< ADD_STUDENT_TO_CLASS");
      if (response.data && response.status === 200) {
        dispatch({
          type: "ADD_STUDENT_TO_CLASS",
          event: response.data,
        });

        dispatch(FETCH_CLASS_STUDENTS(scheduleId))
      }
    } catch (error) {
      console.log(error);
      console.log("something went wrong");
    }
  };
};

export const RENDER_STUDENT = (search = "a") => {
  return async (dispatch) => {
    try {
      let response = await axios.post(`${baseUrl}/api/attendence/search_student/${localStorage.getItem("user_id")}`, {search}, 
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          'content-type': 'application/json'
        }
      })

      console.log(response, " == RENDER_STUDENT response");
      if (response.data && response.status === 200) {
        dispatch({
          type: "RENDER_STUDENT",
          event: response.data.msg,
        });
      }
    } catch (error) {
      console.log(error);
      console.log("something went wrong");
    }
  };
};

export const handleSidebar = (bool) => {
  console.log("bool", bool);
  return (dispatch) => dispatch({ type: "HANDLE_SIDEBAR", status: bool });
};

export const addEvent = (event) => {
  return (dispatch) => {
    dispatch({ type: "ADD_EVENT", event });
  };
};
export const updateEvent = (event) => {
  return (dispatch) => {
    dispatch({ type: "UPDATE_EVENT", event });
  };
};

export const updateDrag = (event) => {
  return (dispatch) => {
    dispatch({ type: "UPDATE_DRAG", event });
  };
};

export const updateResize = (event) => {
  return (dispatch) => {
    dispatch({ type: "EVENT_RESIZE", event });
  };
};

export const handleSelectedEvent = (event) => {
  console.log(event);
  return (dispatch) => dispatch({ type: "HANDLE_SELECTED_EVENT", event });
};
