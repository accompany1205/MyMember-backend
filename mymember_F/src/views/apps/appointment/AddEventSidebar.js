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
} from "reactstrap";
import Flatpickr from "react-flatpickr";

import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss";
import { ADD_APPOINTMENT, UPDATE_APPOINTMENT, APPOINTMENT_REMOVE } from "../../../redux/actions/appointment";
// import { connect } from "formik";
import { connect } from "react-redux";

const eventColors = {
  Event: "chip-success",
  Appoinment: "chip-warning",
  Testing: "chip-danger",
  Camp: "chip-primary",
};

let dropdownOpen = true;

class AddEvent extends React.Component {
  state = {
    app_type: null,
    title: "",
    start_date: new Date(),
    start_time: Date.now() / 1000,
    end_date: new Date(),
    end_time: "",
    allDay: true,
    selectable: true,
    notes: " "
  };

  handleLabelChange = (app_type) => {
    console.log(dropdownOpen);
    dropdownOpen = false;
    this.setState({
      app_type,
    });
  };

  handleDateChange = (e) => {
    this.setState({start_date: e.target.value});
  };

  handleNotesChange = (e) => {
    this.setState({notes: e.target.value});
  };

  handleStartTimeChange = (time) => {
    this.setState({
      start_time: time.target.value,
    });
  };

  handleEndDateChange = (date) => {
    this.setState({
      end_date: date.target.value,
    });
  };

  handleEndTimeChange = (time) => {
    this.setState({
      end_time: time.target.value,
    });
  };

  handleDeleteEvent = (e) => {
    let eventId = e.currentTarget.getAttribute("id");
    if (eventId) {
      const scheduleId = this.props.eventInfo?._id;
      this.props.APPOINTMENT_REMOVE(eventId);
    }

    this.props.handleSidebar(false);
  };

  handleAddEvent = (id) => {
    dropdownOpen = true;
    this.props.handleSidebar(false);
    this.props.addEvent({
      id: id,
      title: this.state.title,
      app_type: this.state.app_type === null ? "others" : this.state.app_type,
      start: this.state.start_date,
      start_time: this.state.start_time,
      end: this.state.end_date,
      end_time: this.state.end_time,
      allDay: this.state.allDay,
      selectable: this.state.selectable,
      notes: this.state.notes
    });

    let appointment = {
      title: this.state.title,
      app_type: this.state.app_type === null ? "others" : this.state.app_type,
      start_date: this.state.start_date,
      end_date: this.state.end_date,
      start_time: this.state.start_time,
      end_time: this.state.end_time,
      allDay: this.state.allDay,
      notes: this.state.notes
    };

    if(this.props.eventInfo !== null && this.props.eventInfo.title?.length > 0 ) {
      this.props.UPDATE_APPOINTMENT(appointment, this.props.eventInfo._id);
    } else {
      this.props.ADD_APPOINTMENT(appointment);
    }

    this.setState({
      app_type: null,
      title: "",
      start_date: new Date(),
      start_time: "",
      end_date: new Date(),
      end_time: "",
      allDay: true,
      selectable: true,
    });
  };

  changeHandler = (e) => {
    this.setState({ ...this.state, [e.target.name]: e.target.value });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      title: nextProps.eventInfo === null ? "" : (nextProps.eventInfo.title ? nextProps.eventInfo.title : ""),
      url: nextProps.eventInfo === null ? "" : nextProps.eventInfo.url,
      start_date:
        nextProps.eventInfo === null
          ? ""
          : nextProps.eventInfo.start_date,
      end_date:
        nextProps.eventInfo === null
          ? ""
          : nextProps.eventInfo.end_date,
      start_time:
        nextProps.eventInfo === null
          ? ""
          : nextProps.eventInfo.start_time,
      end_time:
        nextProps.eventInfo === null
          ? ""
          : nextProps.eventInfo.end_time,
      app_type:
        nextProps.eventInfo === null ? null : nextProps.eventInfo.app_type,
      allDay: nextProps.eventInfo === null ? true : nextProps.eventInfo.allDay,
      selectable:
        nextProps.eventInfo === null ? true : nextProps.eventInfo.selectable,
      notes:
        nextProps.eventInfo === null ? "" : nextProps.eventInfo.notes,
    });
  }

  render() {
    let events = this.props.events.map((i) => i._id);
    let lastId = events.pop();
    let newEventId = lastId + 1;
    
    return (
      <div
        className={`add-event-sidebar ${
          this.props.sidebar ? "show" : "hidden"
        }`}
      >
        <div className="header d-flex justify-content-between">
          <h3 className="text-bold-600 mb-0">
            {this.props.eventInfo !== null &&
            this.props.eventInfo.title?.length > 0
              ? "Update Event"
              : "Add Event"}
          </h3>
          <div
            className="close-icon cursor-pointer"
            onClick={() => this.props.handleSidebar(false)}
          >
            <X size={20} />
          </div>
        </div>
        <div className="add-event-body">
          <div className="add-event-fields mt-2">
            {this.props.eventInfo !== null && 
              <div className="mb-2"><img
                src={require("../../../assets/img/delete.png")}
                id={this.props.eventInfo._id}
                alt="Remove Event"
                onClick={this.handleDeleteEvent}
                style={{cursor: 'pointer' }}
              /> Delete Event </div>
            }

            <div className="event-tags d-inline-block d-sm-flex justify-content-start mt-1 mb-1 w-100">
              <div className="tag mr-1">
                <span className="bullet bullet-success bullet-sm mr-50"></span>
                <span>Event</span>
              </div>
              <div className="tag mr-1">
                <span className="bullet bullet-warning bullet-sm mr-50"></span>
                <span>Appointment</span>
              </div>
              <div className="tag mr-1">
                <span className="bullet bullet-danger bullet-sm mr-50"></span>
                <span>Testing</span>
              </div>
              <div className="tag">
                <span className="bullet bullet-primary bullet-sm mr-50"></span>
                <span>Camp</span>
              </div>
            </div>

            <Label for="EventTitle">Event Title</Label>
            <FormGroup className="form-label-group">
              <Input
                type="text"
                id="EventTitle"
                placeholder="Event Title"
                value={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
            </FormGroup>
            
            <div className="add-event-fields mt-2">
              <Label for="EventAppType">Event Type</Label>
              <Input
                type="select"
                id="EventAppType"
                placeholder="Event Type"
                value={this.state.app_type}
                onChange={(e) => this.setState({ app_type: e.target.value })}
              >
                <option value="Event">Event</option>
                <option value="Appoinment">Appointment</option>
                <option value="Testing">Testing</option>
                <option value="Camp">Camp</option>
              </Input>
            </div>

            <FormGroup className="mt-2">
              <Label for="start_date">Start Date</Label>
              <Input
                type="date"
                id="start_date"
                className="form-control"
                value={this.state.start_date}
                onChange={this.handleDateChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="exampleTime">Start Time</Label>
              <input
                type="time"
                name="starttime"
                className="form-control"
                id="startTime"
                value={this.state.start_time}
                onChange={this.handleStartTimeChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="end_date">End Date</Label>
              <input
                id="end_date"
                type="date"
                className="form-control"
                value={this.state.end_date}
                onChange={this.handleEndDateChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="exampleTime">End Time</Label>
              <input
                type="time"
                className="form-control"
                name="endtime"
                id="endTime"
                value={this.state.end_time}
                onChange={this.handleEndTimeChange}
              />
            </FormGroup>

            <FormGroup>
              <Label for="exampleTime">Notes</Label>
              <Input
                type="textarea"
                className="form-control"
                name="notes"
                value={this.state.notes}
                onChange={this.handleNotesChange}
              />
            </FormGroup>

          </div>
          <hr className="my-2" />
          <div className="add-event-actions text-right">
            <Button.Ripple
              disabled={this.state?.title?.length > 0 ? false : true}
              color="primary"
              onClick={() => {
                this.props.handleSidebar(false);
                this.handleAddEvent(newEventId);
              }}
            >
              {this.props?.eventInfo !== null &&
              this.props.eventInfo?.title?.length > 0
                ? "Update Event"
                : "Add Event"}
            </Button.Ripple>
            <Button.Ripple
              className="ml-1"
              color="flat-danger"
              onClick={() => {
                this.props.handleSidebar(false);
                if (this.props.handleSelectedEvent)
                  this.props.handleSelectedEvent(null);
                else return null;
              }}
            >
              Cancel
            </Button.Ripple>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  console.log(state.appointment);
  return {
    appointment: state.appointment,
  };
};

export default connect(mapStateToProps, {
  ADD_APPOINTMENT,
  UPDATE_APPOINTMENT,
  APPOINTMENT_REMOVE,
})(AddEvent);
