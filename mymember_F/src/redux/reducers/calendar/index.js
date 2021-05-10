const initialState = {
  events: [],
  sidebar: false,
  selectedEvent: null,
  attendeeList: [],
  studentList: [],
  classStudentList: [],
  filterStudents: [],
  studentInfo: null,
  attendenceStudentRemove: ""
};

const calenderReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_EVENTS":
      return { ...state, events: action.events };
    case "ADD_EVENT":
      state.events.push(action.event);
      return { ...state };
    case "UPDATE_EVENT":
      let updatedEvents = state.events.map((event) => {
        if (event.id === action.event.id) {
          return action.event;
        }
        return event;
      });
      return { ...state, events: updatedEvents };
    case "UPDATE_DRAG":
      let eventToDrag = action.event,
        extractedEvent = state.events.map((event) => {
          if (event.id === eventToDrag.id) {
            return eventToDrag;
          }
          return event;
        });
      return { ...state, events: extractedEvent };
    case "EVENT_RESIZE":
      let eventToResize = action.event,
        resizeEvent = state.events.map((event) => {
          if (event.id === eventToResize.id) {
            return eventToResize;
          }
          return event;
        });
      return { ...state, events: resizeEvent };
    case "HANDLE_SIDEBAR":
      return { ...state, sidebar: action.status };
    case "HANDLE_SELECTED_EVENT":
      return { ...state, selectedEvent: action.event };
    case "FETCH_ATTENDEE_LIST":
      return { ...state, attendeeList: action.event };
    case "STUD_GET":
      return { ...state, studentList: action.event };
    case "FETCH_CLASS_STUDENTS":
      return { ...state, classStudentList: action.event };
    case "ADD_STUDENT_TO_CLASS":
      return { ...state, studentInfo: action.event };
    case "RENDER_STUDENT":
      return { ...state, filterStudents: action.event };
    case "ATTENDENCE_STUDENTS_REMOVE":
      return { ...state, attendenceStudentRemove: action.event }
    default:
      return state;
  }
};

export default calenderReducer;
