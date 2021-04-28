import React, { useState } from "react";
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
import axios from "axios";
import { GET_ACTIVE_STUDENT } from "../../../redux/actions/newstudent";
import { FETCH_ATTENDEE_LIST, STUD_GET } from "../../../redux/actions/calendar";
import { connect } from "react-redux";
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss";

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

  componentDidMount() {
    let initialStudents = [];
    //this.props.STUD_GET();
  }

  handleGetStudents() {
    this.props.STUD_GET();
  }

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

  getuserlist(e) {
    console.log("search clicked", e);
    this.setState(this.props.getstudentlist());
    const arrayyr = this.props.getstudentlist();
  }

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
    // let optionItems = this.props.students.map((student) => (
    //   <option key={student.id}>{student.firstName}</option>
    // ));
    //   const [items] = React.useState([
    //   {
    //     label: "Luke Skywalker",
    //     value: "Luke Skywalker"
    //   },
    //   { label: "C-3PO", value: "C-3PO" },
    //   { label: "R2-D2", value: "R2-D2" }
    // ]);

    return (
      <div
        className={`add-event-sidebar ${
          this.props.sidebar ? "show" : "hidden"
        }`}
        style={{ width: "600px" }}
      >
        <Row style={{ margin: "20px" }}>
          <Col sm="6">
            <div className="filter-actions d-flex">
              <Input
                className="w-70 mr-1 mb-1 mb-sm-0"
                type="text"
                placeholder="search..."
                onChange={this.handleGetStudents()}
                value={this.state.searchVal}
              />
              {/* <DropdownToggle caret>Dropdown</DropdownToggle> */}
              {/* <Dropdown isOpen={false} toggle={true}>
                <DropdownItem header>Select</DropdownItem>

                {this.props.calendar?.studentList?.map((Student) => (
                  <DropdownItem key={Student.id} value={Student.id}>
                    {Student.firstName + " " + Student.lastName}
                  </DropdownItem>
                ))}
              </Dropdown> */}
              <select>
                {this.props.calendar?.studentList?.map((Student) => (
                  <option key={Student.id} value={Student.id}>
                    {Student.firstName + " " + Student.lastName}
                  </option>
                ))}
              </select>
            </div>
          </Col>
          <Col sm="4">
            <Button color="primary" size="sm">
              Submit
            </Button>
          </Col>
        </Row>
        <Card>
          <CardBody className="cd-body-rm pd-body">
            <DataTable
              data={this.props.calendar && this.props.calendar?.attendeeList}
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
  // console.log(state);
  return {
    calendar: state.calendar,
  };
};

// const mapStateToProps = (state)=>{
//   return {

//   }
// }

// const mapDispatchToProps = (dispatch) => ({
//   FETCH_ATTENDEE_LIST,
//   HandleGetStudents: () => dispatch(STUD_GET),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(AddEvent);
export default connect(mapStateToProps, {
  FETCH_ATTENDEE_LIST,
  STUD_GET,
})(AddEvent);
// export default AddEvent

// {
//   FETCH_ATTENDEE_LIST,
//   STUD_GET,
// }
