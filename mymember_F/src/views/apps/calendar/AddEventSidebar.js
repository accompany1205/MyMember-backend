import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import SelectSearch from "react-select-search";
import { X, Tag } from "react-feather";
import "./style.css";
import {
  FormGroup,
  Input,
  Label,
  Button,
  Card,
  CardBody,
  Col,
  Row,
  Table
} from "reactstrap";
import { ChevronDown, Info, Mail, Phone, Eye } from "react-feather";
import Flatpickr from "react-flatpickr";
import DataTable from "react-data-table-component";
import { AgGridReact } from "ag-grid-react";
import "../../../assets/scss/pages/users.scss";
import { GET_ACTIVE_STUDENT } from "../../../redux/actions/newstudent";
import {
  FETCH_ATTENDEE_LIST,
  STUD_GET,
  ADD_STUDENT_TO_CLASS,
  FETCH_CLASS_STUDENTS,
  RENDER_STUDENT,
  ATTENDENCE_STUDENTS_REMOVE
} from "../../../redux/actions/calendar";
import { connect } from "react-redux";
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss";
import { ThemeProvider } from "styled-components";
import { data } from "jquery";
import axios from "axios";
import memoize from 'memoize-one';

const baseUrl = process.env.REACT_APP_BASE_URL;
const eventColors = {
  business: "chip-success",
  work: "chip-warning",
  personal: "chip-danger",
  others: "chip-primary",
};

const columns = memoize(handleDeleteStudentAction => [
  {
    name: "Photo",
    selector: "image",
    sortable: true,
    cell: (row) => (
      <img
        className="rounded-circle mr-50"
        src={row.image}
        alt="user avatar"
        height="50"
        width="50"
      />
    ),
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
    cell: (row) => (
      <div style={{
        background: `${row.class_color}`, 
        color: `white`,
        textAlign: `center`,
        padding: `2px`,
        borderRadius: `6px`
      }}>
        {row.class}
      </div>
    )
  },
  {
    name: "Date & Time Attended	",
    selector: "date",
    sortable: true,
    cell: (row) => (
      <span>
        {row.date} {row.time}
      </span>
    )
  },
  {
    name: "Action",
    selector: "_id",
    sortable: true,
    cell: (row) => (
      <img
        src={require("../../../assets/img/delete.png")}
        alt="user delete"
        id={row._id}
        onClick={handleDeleteStudentAction}
        style={{cursor: 'pointer' }}
      />
    ),
    ignoreRowClick: true,
    allowOverflow: true
  },
]);

const customStyles = {
  headCells: {
    style: {
      background: "#1387b0",
      color: "#fff",
      height: "100%",
    },
  },
};

class AddEvent extends React.Component {
  state = {
    value: "Search",
    startDate: new Date(),
    endDate: new Date(),
    title: "",
    label: null,
    allDay: true,
    selectable: true,
    toGetStudents: [],
    searchString: "",
    searchStringIsOpen: false,
    currentSearchInput: "",
    searchInputValue: "",
    searchSelectTime: "",
    defaultColDef: {
      sortable: true,
      resizable: true,
    },
    columnDefs: [
      {
        headerName: "",
        field: "",
        width: 50,
        // filter: false,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: "Photo",
        field: "username",
        // filter: false,
        width: 120,
        cellRendererFramework: (params) => {
          return (
            <div
              className="d-flex align-items-center cursor-pointer"
              onClick={() => console.log("CLicked")}
            >
              <img
                className="rounded-circle mr-50"
                src={params.data.avatar}
                alt="user avatar"
                height="50"
                width="50"
              />
              {/* <span>{params.data.name}</span> */}
            </div>
          );
        },
      },
      {
        headerName: "Full Name",
        field: "firstName",
        // filter: false,
        width: 200,
      },
      {
        headerName: "Status",
        field: "status",
        // filter: false,
        width: 150,
        cellRendererFramework: (params) => {
          return params.value === "active" ? (
            <div className="badge badge-pill badge-light-danger">None</div>
          ) : params.value === "blocked" ? (
            <div className="badge badge-pill badge-light-danger">None</div>
          ) : params.value === "deactivated" ? (
            <div className="badge badge-pill badge-light-danger">None</div>
          ) : null;
        },
      },

      {
        headerName: "Primary Phone",
        field: "country",
        // filter: false,
        width: 200,
      },
      // {
      //   headerName: "Email",
      //   field: "email",
      //   // filter: false,
      //   width: 250
      // },
      {
        headerName: "Program Category",
        field: "status",
        // filter: false,
        width: 200,
        cellRendererFramework: (params) => {
          return params.value === "active" ? (
            <div className="badge badge-pill badge-light-success">Regular</div>
          ) : params.value === "blocked" ? (
            <div className="badge badge-pill badge-light-danger">
              {/* {params.value} */}
              N/A
            </div>
          ) : params.value === "deactivated" ? (
            <div className="badge badge-pill badge-light-warning">
              {params.value}
            </div>
          ) : null;
        },
      },
      {
        headerName: "Belt Rank",
        field: "",
        // filter: false,
        width: 150,
      },
      {
        headerName: "Start Date",
        field: "",
        // filter: false,
        width: 150,
      },
      {
        headerName: "Expire Date",
        field: "",
        // filter: false,
        width: 150,
      },

      {
        headerName: "Rating",
        field: "",
        // filter: false,
        width: 125,
        cellRendererFramework: (params) => {
          return params.value === "active" ? (
            <div className="badge badge-pill badge-light-warning">876</div>
          ) : params.value === "blocked" ? (
            <div className="badge badge-pill badge-light-warning">8768</div>
          ) : params.value === "deactivated" ? (
            <div className="badge badge-pill badge-light-warning">786</div>
          ) : null;
        },
      },
      // {
      //   headerName: "Department",
      //   field: "department",
      //   // filter: false,
      //   width: 160
      // },
      {
        headerName: "Manage",
        field: "transactions",
        width: 150,
        cellRendererFramework: (params) => {
          return (
            <div className="actions cursor-pointer">
              {/* <Edit
                className="mr-50"
                size={15}
                onClick={() => history.push("/app/user/edit")}
              />
              <Trash2
                size={15}
                onClick={() => {
                  let selectedData = this.gridApi.getSelectedRows()
                  this.gridApi.updateRowData({ remove: selectedData })
                }}
              /> */}
              <Info className="mr-50" size={20} />
              <Eye className="mr-50" size={20} />
              <Mail className="mr-50" size={20} />
              <Phone className="mr-50" size={20} />
            </div>
          );
        },
      },
    ],
    pageSize: 20,
  };

  // const [value, setvalue] = useState(initialState)
  async componentDidMount() {
    this.props.RENDER_STUDENT();
    this.props.STUD_GET();
    this.handleInterface();
  }

  handleInterface() {
    let k = this.props.calendar?.filterStudents.map((student) => {
      let option = [];
      option.name = student.firstName + " " + student.lastName;
      option.value = student._id;
      return option;
    });
  }

  addStudentToClass = (e) => {
    let id = e.target.parentElement.getAttribute("value");
    let studentName = e.target.parentElement.getAttribute("text");
    let scheduleId = this.props.eventInfo?._id;
    let time = Date.now();

    this.setState({
      searchStringIsOpen: false,
      currentSearchInput: studentName,
      searchInputValue: id
    });

    this.props.FETCH_CLASS_STUDENTS(scheduleId);
  };

  handleDeleteStudent = (e) => {
    let attendanceId = e.currentTarget.getAttribute("id");
    if (attendanceId) {
      const scheduleId = this.props.eventInfo?._id;
      this.props.ATTENDENCE_STUDENTS_REMOVE(attendanceId, scheduleId);
    }
  };

  handleSearchChanged = (e) => {
    if(this.state.value) {
      this.setState({
        searchStringIsOpen: true,
        currentSearchInput: e.target.value,
        searchString: e.target.value
      });
      this.props.RENDER_STUDENT(this.state.searchString);
    } else {
      this.setState({searchStringIsOpen: false}); 
    }
  }

  handleSearch = (e) => {
    const scheduleId = this.props.eventInfo?._id;
    const { searchInputValue, searchSelectTime } = this.state;
    if (searchSelectTime && searchSelectTime) {
      this.props.ADD_STUDENT_TO_CLASS(scheduleId, searchInputValue, searchSelectTime);
    }
  };

  onTimeChange = (e) => {
    this.setState({searchSelectTime: e.target.value});
  }

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
    const { rowData, columnDefs, defaultColDef, pageSize } = this.state;
    let style = {
      position: "absolute",
      top: "20px",
      right: "20px",
    };

    let suggestionsListComponent;
    if (this.props.calendar && this.state.searchStringIsOpen) {
      if (this.props?.calendar && this.props.calendar.filterStudents) {
        suggestionsListComponent = (
          <div id="demo12114">  
              <Table>
                <tbody>
                  <tr class="tab_str22">
                    <th class="ss_hed">Name</th>
                    <th class="ss_hed">Type</th>
                    <th class="ss_hed">Age</th>
                    <th class="ss_hed">Rank</th>
                  </tr>
                    {this.props.calendar.filterStudents.map((student) => {
                      return ( 
                        <tr key={student._id}
                          value={student._id}
                          text={student.firstName + " " + student.lastName}
                          className="tab_str33" onClick={this.addStudentToClass}>
                          <td>
                            {student.firstName + " " + student.lastName}
                          </td>
                          <td>
                            {student.studentType}
                          </td>
                          <td>
                            {student.age}
                          </td>
                          <td>

                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </Table>
          </div>
        );
      } else {
        suggestionsListComponent = (
          <div class="no-suggestions">
            <em>No suggestions!</em>
          </div>
        );
      }
    }


    return (
      <div
        className={`add-event-sidebar ${
          this.props.sidebar ? "show" : "hidden"
        }`}
        style={{ width: "600px" }}
      >
        <Row style={{ margin: "20px" }}>
          <h1>{this.props.eventInfo?.class_name}</h1>
          <h4 style={style}>
            {this.props.calendar?.classStudentList?.data?.class_attendance
              ? "Total: " +
                this.props.calendar?.classStudentList?.data?.class_attendance
                  .length
              : "Total: " + 0}
          </h4>
        </Row>
        <Row style={{ margin: "20px" }}>
          <Col sm="7">
            <div className="filter-actions d-flex">
              <Input
                value={this.state.currentSearchInput}
                placeholder="Scan or Type Student Here"
                onChange={this.handleSearchChanged}
              />
              {suggestionsListComponent} 
            </div>
          </Col>
          <Col sm="2">
            &nbsp;
          </Col>
          <Col sm="3" className="mb-1">
            <Input id="time" name="time"
              className="pr-1"
              type="time"
              value={this.state.searchSelectTime}
              onChange={this.onTimeChange}
            />
          </Col>
        </Row>
        <Row style={{ margin: "20px" }}>
          <Col sm="12" className="text-right">
            <Button color="primary" onClick={this.handleSearch}>
              Submit
            </Button>
          </Col>
        </Row>
        <Card>
          <CardBody className="cd-body-rm pd-body">
            <DataTable
              data={
                this.props.calendar?.classStudentList?.data?.class_attendance
              }
              columns={columns(this.handleDeleteStudent)}
              noHeader
              fixedHeader
              fixedHeaderScrollHeight="500px"
              customStyles={customStyles}
              width="800px"
              style={{ height: 732 }}
              onSelectedRowsChange={this.handleDeleteStudent}
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    calendar: state.calendar,
  };
};

export default connect(mapStateToProps, {
  FETCH_ATTENDEE_LIST,
  STUD_GET,
  ADD_STUDENT_TO_CLASS,
  FETCH_CLASS_STUDENTS,
  ATTENDENCE_STUDENTS_REMOVE,
  RENDER_STUDENT,
})(AddEvent);
