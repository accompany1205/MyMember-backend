import React from "react";
import { Button, Card, CardBody, CardHeader, CardTitle } from "reactstrap";
import DataTable from "react-data-table-component";
import "../../../assets/scss/pages/users.scss";

// import
import { FETCH_ATTENDEE_LIST, ATTENDENCE_STUDENTS_REMOVE } from "../../../redux/actions/calendar";
import { connect } from "react-redux";
import memoize from 'memoize-one';

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
    selector: "id",
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
  },
]);

const customStyles = {
  headCells: {
    style: {
      background: "#1387b0",
      color: "#fff",
    },
  },
};

class DataTableFixedHeader extends React.Component {
  componentDidMount() {
    this.props.FETCH_ATTENDEE_LIST();
  }

  handleDeleteStudent = (e) => {
    let attendanceId = e.currentTarget.getAttribute("id");
    if (attendanceId) {
      this.props.ATTENDENCE_STUDENTS_REMOVE(attendanceId);
    }
    this.props.FETCH_ATTENDEE_LIST();
  };

  render() {
    console.log("tablesidebar >> ", this.props.calendar && this.props.calendar?.attendeeList);
    return (
      <Card>
        <CardBody className="cd-body-rm pd-body">
          <DataTable
            data={this.props.calendar && this.props.calendar?.attendeeList}
            columns={columns(this.handleDeleteStudent)}
            noHeader
            fixedHeader
            fixedHeaderScrollHeight="300px"
            customStyles={customStyles}
            onSelectedRowsChange={this.handleDeleteStudent}
          />
        </CardBody>
      </Card>
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
  ATTENDENCE_STUDENTS_REMOVE
})(
  DataTableFixedHeader
);

// export default DataTableFixedHeader
