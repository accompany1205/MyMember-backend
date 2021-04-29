const initialState = {
  appointmentInfo: [],
};

const appointmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_APPOINTMENT":
      return { ...state, appointmentInfo: action.event };

    default:
      return state;
  }
};

export default appointmentReducer;
