const initialState = {
  appointmentInfo: [],
  events: [],
};

const appointmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_APPOINTMENT":
      return { ...state, events: action.event };
    case "APPOINTMENT_REMOVE":
      return { ...state, events: action.event };
    case "UPDATE_APPOINTMENT":
      return { ...state, events: action.event };
    case "FETCH_EVENTS":
      return { ...state, events: action.events };
    default:
      return state;
  }
};

export default appointmentReducer;
