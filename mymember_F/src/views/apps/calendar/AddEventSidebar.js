import React, { useState, useEffect } from "react";
import { X, Tag } from "react-feather";
import {
  Dropdown,
  UncontrolledDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Input,
  Label,
  Button,
  Card,
  CardBody,
  Col,
  Row,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import DataTable from "react-data-table-component";
import "../../../assets/scss/pages/users.scss";
import { GET_ACTIVE_STUDENT } from "../../../redux/actions/newstudent";
import {
  FETCH_ATTENDEE_LIST,
  STUD_GET,
  ADD_STUDENT_TO_CLASS,
} from "../../../redux/actions/calendar";
import { connect } from "react-redux";
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss";
import { ThemeProvider } from "styled-components";

const baseUrl = process.env.REACT_APP_BASE_URL;
const eventColors = {
  business: "chip-success",
  work: "chip-warning",
  personal: "chip-danger",
  others: "chip-primary",
};

const columns = [
  {
    name: "Photo",
    selector: "firstphoto",
    sortable: true,
  },
  {
    name: "Name",
    selector: "firstName",
    sortable: true,
  },
  {
    name: "Classes",
    selector: "class",
    sortable: true,
  },
  {
    name: "Date & Time Attended	",
    selector: "date",
    sortable: true,
  },
  {
    name: "Action",
    selector: "id",
    sortable: true,
  },
];

const customStyles = {
  headCells: {
    style: {
      background: "#1387b0",
      color: "#fff",
      height: "100%",
    },
  },
};

const students = [];

// const names = [
//   {label: "My Name", value: "M"},
//   {label: "Deepak", value: "D"},
//   {label: "Steve", value: "S"},
//   {label: "Bred", value: "B"},
// ]

// const [name, setName] = useState("Select a Name")

// let handleNameChange = (e) =>{
//   setName(e.target.value)
// }

class AddEvent extends React.Component {
  state = {
    startDate: new Date(),
    endDate: new Date(),
    title: "",
    label: null,
    allDay: true,
    selectable: true,
  };

  // const [value, setvalue] = useState(initialState)
  async componentDidMount() {
    this.props.STUD_GET();
  }

  // handleGetStudents() {
  //   this.props.STUD_GET();
  //   // this.handleGetStudents();
  // }

  //to add student to list
  addStudentToClass = (e) => {
    // this.setState({
    //   value: e.target.value,
    // });
    console.log(this.props.eventInfo?._id);
    let id = e.target.value;
    let scheduleId = this.props.eventInfo?._id;
    let time = Date.now();
    // let optionElement = e.target.childNodes[index];
    // console.log("Selected User", e.target.value);
    // this.props.ADD_STUDENT_TO_CLASS(scheduleId, id);
    console.log("Selected User", scheduleId, id, time);
    // console.log("Selected User", optionElement);
    this.props.ADD_STUDENT_TO_CLASS(scheduleId, id, time);
    this.props.FETCH_ATTENDEE_LIST();
    // this.props.calendar.studentList = [];
  };

  handleDateChange = (date) => {
    this.setState({
      startDate: date,
    });
  };

  handleEndDateChange = (date) => {
    this.setState({
      endDate: date,
    });
  };

  handleLabelChange = (label) => {
    this.setState({
      label,
    });
  };

  handleAddEvent = (id) => {
    this.props.handleSidebar(false);
    this.props.addEvent({
      id: id,
      title: this.state.title,
      start: this.state.startDate,
      end: this.state.endDate,
      label: this.state.label === null ? "others" : this.state.label,
      allDay: this.state.allDay,
      selectable: this.state.selectable,
    });
    this.setState({
      startDate: new Date(),
      endDate: new Date(),
      title: "",
      label: null,
      allDay: true,
      selectable: true,
    });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      title: nextProps.eventInfo === null ? "" : nextProps.eventInfo.title,
      url: nextProps.eventInfo === null ? "" : nextProps.eventInfo.url,
      startDate:
        nextProps.eventInfo === null
          ? new Date()
          : new Date(nextProps.eventInfo.start),
      endDate:
        nextProps.eventInfo === null
          ? new Date()
          : new Date(nextProps.eventInfo.end),
      label: nextProps.eventInfo === null ? null : nextProps.eventInfo.label,
      allDay: nextProps.eventInfo === null ? true : nextProps.eventInfo.allDay,
      selectable:
        nextProps.eventInfo === null ? true : nextProps.eventInfo.selectable,
    });
  }

  render() {
    let events = this.props.events.map((i) => i.id);
    let lastId = events.pop();
    let newEventId = lastId + 1;
    console.log(this.props);
    console.log(lastId);
    // if( this.props.sele)

    return (
      <div
        className={`add-event-sidebar ${
          this.props.sidebar ? "show" : "hidden"
        }`}
        style={{ width: "600px" }}
      >
        <Row style={{ margin: "20px" }}>
          <h1>{this.props.eventInfo?.class_name}</h1>
        </Row>
        <Row style={{ margin: "20px" }}>
          <Col sm="6">
            <div className="filter-actions d-flex">
              {this.props.calendar ? (
                <Input
                  className="w-70 mr-1 mb-1 mb-sm-0"
                  type="select"
                  placeholder="search..."
                  onChange={this.addStudentToClass}
                >
                  {this.props.calendar
                    ? this.props.calendar?.studentList.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.firstName + " " + student.lastName}
                        </option>
                      ))
                    : ""}
                </Input>
              ) : (
                ""
              )}
              {/* <DropdownToggle caret>Dropdown</DropdownToggle> */}
              {/* <Dropdown isOpen={false} toggle={true}>
                <DropdownItem header>Select</DropdownItem>

                {this.props.calendar?.studentList?.map((Student) => (
                  <DropdownItem key={Student.id} value={Student.id}>
                    {Student.firstName + " " + Student.lastName}
                  </DropdownItem>
                ))} 
              </Dropdown> */}
              {/* <select onChange={this.addStudentToClass}>
                {this.props.calendar?.studentList?.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.firstName + " " + student.lastName}
                  </option>
                ))}
              </select> */}
            </div>
          </Col>
          <Col sm="4">
            {/* <Button color="primary" size="sm">
              Submit
            </Button> */}
          </Col>
        </Row>
        <Card>
          <CardBody className="cd-body-rm pd-body">
            <DataTable
              data={this.props.calendar?.attendeeList}
              columns={columns}
              noHeader
              fixedHeader
              fixedHeaderScrollHeight="500px"
              customStyles={customStyles}
              width="800px"
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  console.log(state);
  return {
    calendar: state.calendar,
  };
};

export default connect(mapStateToProps, {
  FETCH_ATTENDEE_LIST,
  STUD_GET,
  ADD_STUDENT_TO_CLASS,
})(AddEvent);
