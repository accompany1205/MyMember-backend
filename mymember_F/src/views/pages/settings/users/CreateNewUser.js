import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  FormGroup,
  Row,
  Col,
  Input,
  Form,
  Button,
  Label, CustomInput
} from "reactstrap"

import img from "../../../../assets/img/pages/1-apex.png"
import { CREATE_SUB_USER } from '../../../../redux/actions/settings/schedule';
import { connect } from 'react-redux';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class FloatingLabels extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fullName: "",
      userName: "",
      password: "",
      email: "",
      phone: "",
      status: "Active",
      profile_type: "Employee",
      profile_image: ""
    }
    this.changeHandler = this.changeHandler.bind(this);
    this.onsubmit = this.onsubmit.bind(this);


  }

  changeHandler(e) {

    this.setState({ ...this.state, [e.target.name]: e.target.value });

  }

  onsubmit(e) {

    const notify = () => toast.success("user creating please wait.....", {
      position: "top-center", autoClose: 3000, textStyle: {
        textAlign: "center"
      }
    });

    console.log(">>>>>>>>>>>>>>", this.state)
    e.preventDefault();
    this.props.CREATE_SUB_USER(this.state);

    notify();

    setTimeout(() => {
      this.props.toggle();
    }, 3500)
  }





  render() {

    return (

      <Card>
        <ToastContainer />
        <CardHeader>
          {/* <CardTitle>Vertical Form With Floating Labels</CardTitle> */}
        </CardHeader>
        <CardBody>
          <Form className="mt-10" onSubmit={this.onsubmit} >
            <Row>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="fullName"
                    value={this.state.fullName}
                    onChange={this.changeHandler}
                    id="fullName"
                    placeholder="Full Name"
                    required
                  />
                  <Label for="nameFloating">Full Name</Label>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="userName"
                    value={this.state.userName}
                    onChange={this.changeHandler}
                    id="userName"
                    placeholder="User Name"
                  />
                  <Label for="nameFloating">User Name</Label>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Input
                    type="password"
                    name="password"
                    value={this.state.password}
                    onChange={this.changeHandler}
                    id="password"
                    placeholder="Password"
                    required
                  />
                  <Label for="passwordFloating">Password</Label>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Input
                    type="password"
                    name="retype password"
                    value={this.state.password}
                    id="nameFloating"
                    placeholder="Retype Password"
                    required
                  />
                  <Label for="nameFloating">Retype Password</Label>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Input
                    type="email"
                    name="email"
                    value={this.state.email}
                    onChange={this.changeHandler}
                    id="email"
                    placeholder="Email"
                  />
                  <Label for="EmailFloating">Email</Label>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Input
                    type="phone"
                    name="phone"
                    value={this.state.phone}
                    onChange={this.changeHandler}
                    id="phone"
                    placeholder="Phone"
                  />
                  <Label for="mobileFloating">Mobile</Label>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Label> Status </Label>
                  <CustomInput type="select" name="status" value={this.state.status} onChange={this.changeHandler} id="status">
                    <option>Active</option>
                    <option>Inactive</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Label> Profile Type </Label>
                  <CustomInput type="select" name="profile_type" value={this.state.profile_type} onChange={this.changeHandler} id="profile_type">
                    <option>Administrator</option>
                    <option>Employee</option>
                    <option>Global Admin</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <img src={!!this.state.profile_image ? URL.createObjectURL(this.state.profile_image) : img} width="100px" />
                  <Input
                    type="file"
                    name="profile_image"
                    // value={this.state}
                    onChange={(e) => this.setState({ ...this.state, profile_image: e.target.files[0] })}
                    id="fileFloating"

                  />
                  {/* <Label for="nameFloating">Program Image</Label> */}
                </FormGroup>
              </Col>

              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Button.Ripple
                    color="primary"
                    type="submit"
                    className="mr-1 mb-1"
                  // onClick={e => e.preventDefault()}
                  >
                    Save
                  </Button.Ripple>
                  <Button.Ripple
                    outline
                    color="warning"
                    type="reset"
                    className="mb-1"
                  >
                    Delete
                  </Button.Ripple>
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    )
  }
}
const mapStateToProps = (state) => {
  return {

  };
}
export default connect(mapStateToProps, { CREATE_SUB_USER })(FloatingLabels);
