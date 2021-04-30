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
import { ADD_APPOINTMENT } from "../../../redux/actions/appointment";
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
    start_time: "",
    end_date: new Date(),
    end_time: "",
    allDay: true,
    selectable: true,
  };

  handleLabelChange = (app_type) => {
    console.log(dropdownOpen);
    dropdownOpen = false;
    this.setState({
      app_type,
    });
  };

  handleDateChange = (date) => {
    this.setState({
      start_date: date,
    });
    console.log(date);
  };

  handleStartTimeChange = (time) => {
    this.setState({
      start_time: time,
    });
    console.log(time);
  };

  handleEndDateChange = (date) => {
    this.setState({
      end_date: date,
    });
  };

  handleEndTimeChange = (time) => {
    this.setState({
      end_time: time,
    });
  };
  // handleAppTypeChange = (app_type) => {
  //   this.setState({
  //     app_type,
  //   });
  // };

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
    });
    let appointment = {
      title: this.state.title,
      app_type: this.state.app_type === null ? "others" : this.state.app_type,
      start: this.state.start_date,
      start_time: "7:30",
      end: this.state.end_date,
      end_time: "13:30",
      allDay: this.state.allDay,
      selectable: this.state.selectable,
    };
    console.log(appointment);
    this.props.ADD_APPOINTMENT(appointment);
    this.setState({
      app_type: null,
      title: "",
      start_date: new Date(),
      start_time: null,
      end_date: new Date(),
      end_time: null,
      allDay: true,
      selectable: true,
    });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      title: nextProps.eventInfo === null ? "" : nextProps.eventInfo.title,
      url: nextProps.eventInfo === null ? "" : nextProps.eventInfo.url,
      start_date:
        nextProps.eventInfo === null
          ? new Date()
          : new Date(nextProps.eventInfo.start),
      end_date:
        nextProps.eventInfo === null
          ? new Date()
          : new Date(nextProps.eventInfo.end),
      app_type:
        nextProps.eventInfo === null ? null : nextProps.eventInfo.app_type,
      allDay: nextProps.eventInfo === null ? true : nextProps.eventInfo.allDay,
      selectable:
        nextProps.eventInfo === null ? true : nextProps.eventInfo.selectable,
    });
  }

  render() {
    let events = this.props.events.map((i) => i.id);
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
          <div className="category-action d-flex justify-content-between my-50">
            <div className="event-category">
              {this.state.app_type !== null ? (
                <div className={`chip ${eventColors[this.state.app_type]}`}>
                  <div className="chip-body">
                    <div className="chip-text text-capitalize">
                      {this.state.app_type}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="category-dropdown">
              <UncontrolledDropdown>
                <Dropdown isOpen={dropdownOpen}>
                  <DropdownToggle tag="div" className="cursor-pointer">
                    <Tag size={18} />
                  </DropdownToggle>
                  <DropdownMenu tag="ul" right>
                    <DropdownItem
                      tag="li"
                      onClick={() => this.handleLabelChange("Event")}
                    >
                      <span className="bullet bullet-success bullet-sm mr-50"></span>
                      <span>Event</span>
                    </DropdownItem>
                    <DropdownItem
                      tag="li"
                      onClick={() => this.handleLabelChange("Appoinment")}
                    >
                      <span className="bullet bullet-warning bullet-sm mr-50"></span>
                      <span>Appointment</span>
                    </DropdownItem>
                    <DropdownItem
                      tag="li"
                      onClick={() => this.handleLabelChange("Testing")}
                    >
                      <span className="bullet bullet-danger bullet-sm mr-50"></span>
                      <span>Testing</span>
                    </DropdownItem>
                    <DropdownItem
                      tag="li"
                      onClick={() => this.handleLabelChange("Camp")}
                    >
                      <span className="bullet bullet-primary bullet-sm mr-50"></span>
                      <span>Camp</span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </UncontrolledDropdown>
            </div>
          </div>
          {/* <div className="add-event-fields mt-2">
            <Label for="EventAppType">Event Type</Label>
            <Input
              type="select"
              id="EventAppType"
              placeholder="Event Type"
              value={this.state.title}
              onChange={(e) => this.setState({ app_type: e.target.value })}
            >
              <option value="Event">Event</option>
              <option value="Appointment">Appointment</option>
              <option value="Test">Testing</option>
              <option value="Camping">Camp</option>
            </Input>
          </div> */}
          <div className="add-event-fields mt-2">
            <FormGroup className="form-label-group">
              <Input
                type="text"
                id="EventTitle"
                placeholder="Event Title"
                value={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
              <Label for="EventTitle">Event Title</Label>
            </FormGroup>
            <FormGroup>
              <Label for="start_date">Start Date</Label>
              <Flatpickr
                id="start_date"
                className="form-control"
                value={this.state.start_date}
                onChange={(date) => this.handleDateChange(date)}
                options={{
                  altInput: true,
                  altFormat: "F j, Y",
                  dateFormat: "Y-m-d",
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label for="exampleTime">Start Time</Label>
              <Input
                type="time"
                name="starttime"
                id="startTime"
                placeholder="time placeholder"
                onChange={(time) => this.handleStartTimeChange(time)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="end_date">End Date</Label>
              <Flatpickr
                id="end_date"
                className="form-control"
                value={this.state.end_date}
                onChange={(date) => this.handleEndDateChange(date)}
                options={{
                  altInput: true,
                  altFormat: "F j, Y",
                  dateFormat: "Y-m-d",
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label for="exampleTime">End Time</Label>
              <Input
                type="time"
                name="endtime"
                id="endTime"
                placeholder="time placeholder"
                onChange={(time) => this.handleEndTimeChange(time)}
              />
            </FormGroup>
          </div>
          <hr className="my-2" />
          <div className="add-event-actions text-right">
            <Button.Ripple
              disabled={this.state.title.length > 0 ? false : true}
              color="primary"
              onClick={() => {
                this.props.handleSidebar(false);
                if (
                  this.props.eventInfo === null ||
                  this.props.eventInfo.title.length <= 0
                )
                  this.handleAddEvent(newEventId);
                else {
                  this.props.updateEvent({
                    id: this.props.eventInfo.id,
                    title: this.state.title,
                    app_type: this.state.app_type,
                    start: this.state.start_date,
                    end: this.state.end_date,
                    allDay: true,
                    selectable: true,
                  });
                  // this.props.ADD_APPOINTMENT();
                }
              }}
            >
              {this.props.eventInfo !== null &&
              this.props.eventInfo.title.length > 0
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
})(AddEvent);
