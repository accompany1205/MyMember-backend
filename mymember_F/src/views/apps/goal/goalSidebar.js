import React from "react"
import { Button, ListGroup, ListGroupItem } from "reactstrap"
import PerfectScrollbar from "react-perfect-scrollbar"
import { X, Layers, Star, Info, Check, Trash, CheckSquare, Clock, Calendar, Settings } from "react-feather"
import { connect } from "react-redux"
import { changeFilter } from "../../../redux/actions/goal/index"
import ModalForm from "./settingModal"
class GoalSidebar extends React.Component {
  render() {
    return (
      <React.Fragment>
        <span
          className="sidebar-close-icon"
          onClick={() => this.props.mainSidebar(false)}
        >
          <X size={15} />
        </span>
        <div className="todo-app-menu">
          <div className="add-task">
            <Button.Ripple
              block
              className="btn-block my-1"
              color="primary"
              onClick={() => {
                this.props.addTask("open")
                this.props.mainSidebar(false)
              }}
            >
              Add Goal
            </Button.Ripple>
          </div>
          <PerfectScrollbar
            className="sidebar-menu-list"
            options={{
              wheelPropagation: false
            }}
          >
            <ListGroup className="font-medium-1">
              <ListGroupItem
                className="border-0 pt-0"
                action
                onClick={() => {
                  this.props.changeFilter("all")
                }}
                active={
                  this.props.routerProps.location.pathname === "/goal/all"
                    ? true
                    : false
                }
              >
                <Layers size={22} />
                <span className="align-middle ml-1">All</span>
                <div class="badge badge-pill badge-primary mt-25 float-right">
                  <span class="align-middle">3</span>
                </div>
              </ListGroupItem>
            </ListGroup>
            <hr />
            <h5 className="mt-2 mb-1 pt-25">Filters</h5>
            <ListGroup className="font-medium-1">
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("weekly_goal")
                }}
                active={
                  this.props.routerProps.location.pathname === "/goal/weekly_goal"
                    ? true
                    : false
                }
              >
                <CheckSquare size={22} />
                <span className="align-middle ml-1">Weekly Goal</span>
                <div class="badge badge-pill badge-primary mt-25 float-right">
                  <span class="align-middle">3</span>
                </div>
              </ListGroupItem>
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("monthly_goal")
                }}
                active={
                  this.props.routerProps.location.pathname === "/goal/monthly_goal"
                    ? true
                    : false
                }
              >
                <Clock size={22} />
                <span className="align-middle ml-1">Monthly Goal</span>
                <div class="badge badge-pill badge-primary mt-25 float-right">
                  <span class="align-middle">3</span>
                </div>
              </ListGroupItem>
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("quarterly_goal")
                }}
                active={
                  this.props.routerProps.location.pathname === "/goal/quarterly_goal"
                    ? true
                    : false
                }
              >
                <Calendar size={22} />
                <span className="align-middle ml-1">Quarterly Goal</span>
                <div class="badge badge-pill badge-primary mt-25 float-right">
                  <span class="align-middle">3</span>
                </div>
              </ListGroupItem>
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("annual_goal")
                }}
                active={
                  this.props.routerProps.location.pathname === "/goal/annual_goal"
                    ? true
                    : false
                }
              >
                <Check size={22} />
                <span className="align-middle ml-1">Annual Goal</span>
                <div class="badge badge-pill badge-primary mt-25 float-right">
                  <span class="align-middle">3</span>
                </div>
              </ListGroupItem>
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("all_goals")
                }}
                active={
                  this.props.routerProps.location.pathname === "/goal/all_goals"
                    ? true
                    : false
                }
              >
                <Trash size={22} />
                <span className="align-middle ml-1">All Goals</span>
                <div class="badge badge-pill badge-primary mt-25 float-right">
                  <span class="align-middle">3</span>
                </div>
              </ListGroupItem>
            </ListGroup>
            <hr />
            <h5 className="mt-2 mb-1 pt-25">Settings</h5>
            <ListGroup className="font-medium-1">
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("all")
                }}
                // active={
                //   this.props.routerProps.location.pathname === "/goal/all"
                //     ? true
                //     : false
                // }
              >
                <Settings size={22} />
                <ModalForm />
                <span className="align-middle ml-1">Goal Setting</span>
                {/* <div class="badge badge-pill badge-primary mt-25 float-right">
                  <span class="align-middle">3</span>
                </div> */}
              </ListGroupItem>
            </ListGroup>
            {/* <hr />
            <h5 className="mt-2 mb-1 pt-25">Labels</h5>
            <ListGroup className="font-medium-1">
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("frontend")
                }}
                active={
                  this.props.routerProps.location.pathname === "/todo/frontend"
                    ? true
                    : false
                }
              >
                <span className="bullet bullet-primary align-middle" />
                <span className="align-middle ml-1">Frontend</span>
              </ListGroupItem>
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("backend")
                }}
                active={
                  this.props.routerProps.location.pathname === "/todo/backend"
                    ? true
                    : false
                }
              >
                <span className="bullet bullet-warning align-middle" />
                <span className="align-middle ml-1">Backend</span>
              </ListGroupItem>
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("doc")
                }}
                active={
                  this.props.routerProps.location.pathname === "/todo/doc"
                    ? true
                    : false
                }
              >
                <span className="bullet bullet-success align-middle" />
                <span className="align-middle ml-1">Doc</span>
              </ListGroupItem>
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  this.props.changeFilter("bug")
                }}
                active={
                  this.props.routerProps.location.pathname === "/todo/bug"
                    ? true
                    : false
                }
              >
                <span className="bullet bullet-danger align-middle" />
                <span className="align-middle ml-1">Bug</span>
              </ListGroupItem>
            </ListGroup> */}
          </PerfectScrollbar>
        </div>
      </React.Fragment>
    )
  }
}

export default connect(null, { changeFilter })(GoalSidebar)
