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
  Label,CustomInput
} from "reactstrap"

// import Checkbox from "../../../../components/@vuexy/checkbox/CheckboxesVuexy"
// import img from "../../../../assets/img/pages/1-apex.png"
import { Check } from "react-feather";
import {connect} from 'react-redux';
import {setSetting} from '../../../redux/actions/goal/index';
import "../../../assets/scss/pages/users.scss"
import img from "../../../assets/img/pages/1-apex.png"
class FloatingLabels extends React.Component {

  constructor(props){
    super(props);
    this.state={
      membership_name : "",
      color : "",
      membership_type : "",
      duration_time : 0,
      duration_type : "",
      total_price : 0,
      down_payment : 0,
      payment_type : "",
      balance : 0,
      payment_time : 0,
      payments_types : "",
      pay : 0,
      due_every : 0,
      membership_profile : ""
    }
    this.changeHandler = this.changeHandler.bind(this);
  }

  componentDidUpdate(prevProps){
    if(this.props.shop.membershipList.length > prevProps.shop.membershipList.length){
      this.props.toggle();
    }
  }

  changeHandler(e){
    // console.log(e.target.name, e.target.value);
    this.setState({...this.state, [e.target.name] : e.target.value});
  }

  onsubmit = (e) => {
    e.preventDefault();
    console.log(this.state)
    this.props.setSetting(this.state);
  }

  
  render() {
    return (
      <Card>
        {/* <CardHeader>
          <CardTitle>Vertical Form With Floating Labels</CardTitle>
        </CardHeader> */}
        <CardBody>
          <Form className="mt-10" onSubmit={this.onsubmit}>
            <h5>Menbership Goals</h5>
            <hr/>
            <Row>
              <Col sm="3">
              <div><Label for="active_students">Active Students</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="active_students"
                    // value={this.state.membership_name}
                    id="active_students"
                    placeholder="Active Students"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="active_students_type">Active Students Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="active_students_type" 
                    // value={this.state.membership_type} 
                    id="active_students_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="leads">Leads</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="leads"
                    // value={this.state.membership_name}
                    id="leads"
                    placeholder="Leads"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="leads_type">Leads Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="leads_type" 
                    // value={this.state.membership_type}
                    id="leads_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="active_trials">Active Trials</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="active_trials"
                    // value={this.state.membership_name}
                    id="active_trials"
                    placeholder="Active Trials"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="active_trials_type">Active Trials Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="active_trials_type" 
                    // value={this.state.membership_type}
                    id="active_trials_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newstudents">New Students</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="newstudents"
                    // value={this.state.membership_name}
                    id="newstudents"
                    placeholder="New Students"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newstudents_type">New Students Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="newstudents_type" 
                    // value={this.state.membership_type}
                    id="newstudents_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newBBC">New BBC</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="newBBC"
                    // value={this.state.membership_name}
                    id="newBBC"
                    placeholder="New BBC"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newBBC_type">New BBC Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="newBBC_type" 
                    // value={this.state.membership_type}
                    id="newBBC_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newLC">New LC</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="newLC"
                    // value={this.state.membership_name}
                    id="newLC"
                    placeholder="New LC"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newLC_type">New LC Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="newLC_type" 
                    // value={this.state.membership_type}
                    id="newLC_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newIC">New IC</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="newIC"
                    // value={this.state.membership_name}
                    id="newIC"
                    placeholder="New IC"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newIC_type">New IC Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="newIC_type" 
                    value={this.state.membership_type} 
                    id="newIC_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newMC">New MC</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="newMC"
                    // value={this.state.membership_name}
                    id="newMC"
                    placeholder="New MC"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="newMC_type">New MC Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="newMC_type" 
                    // value={this.state.membership_type}
                    id="newMC_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="birthday_book_1">Birthday's Booked</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="birthday_book_1"
                    // value={this.state.membership_name}
                    id="birthday_book_1"
                    placeholder="Birthday's Booked"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="birthday_book_1_type">Birthday's Booked Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="birthday_book_1_type" 
                    // value={this.state.membership_type}
                    id="birthday_book_1_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="birthday_book_2">Birthday's Booked</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="birthday_book_2"
                    // value={this.state.membership_name}
                    id="birthday_book_2"
                    placeholder="Birthday's Booked"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="birthday_book_1_type">Birthday's Booked Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="birthday_book_1_type" 
                    // value={this.state.membership_type}
                    id="birthday_book_1_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="birthday_book_3">Birthday's Booked</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="birthday_book_3"
                    // value={this.state.membership_name}
                    id="birthday_book_3"
                    placeholder="Birthday's Booked"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="birthday_book_1_type">Birthday's Booked Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="birthday_book_1_type" 
                    // value={this.state.membership_type}
                    id="birthday_book_1_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="birthday_book_4">Birthday's Booked</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="birthday_book_4"
                    // value={this.state.membership_name}
                    id="birthday_book_4"
                    placeholder="Birthday's Booked"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="birthday_book_4_type">Birthday's Booked Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="birthday_book_4_type" 
                    // value={this.state.membership_type}
                    id="birthday_book_4_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
            </Row>
            <hr/>
            <h5>Financial Goals</h5>
            <hr/>
            <Row>
              <Col sm="3">
              <div><Label for="gross_income">Gross Income</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="gross_income"
                    // value={this.state.membership_name}
                    id="gross_income"
                    placeholder="Gross Income"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="gross_income_type">Gross Income Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="gross_income_type" 
                    // value={this.state.membership_type}
                    id="gross_income_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="BBC_income">BBC Income</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="BBC_income"
                    // value={this.state.membership_name}
                    id="BBC_income"
                    placeholder="BBC Income"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="BBC_income_type">BBC Income Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="BBC_income_type" 
                    // value={this.state.membership_type}
                    id="BBC_income_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="LIM_income">LC,IC & MC Income</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="LIM_income"
                    // value={this.state.membership_name}
                    id="LIM_income"
                    placeholder="LC,IC & MC Income"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="LIM_income_type">LC,IC & MC Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="LIM_income_type" 
                    // value={this.state.membership_type}
                    id="LIM_income_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="camp_income">Camp Income</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="camp_income"
                    // value={this.state.membership_name}
                    id="camp_income"
                    placeholder="Camp Income"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="camp_income_type">Camp Income Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="camp_income_type" 
                    // value={this.state.membership_type}
                    id="camp_income_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="afterschool_income">After School Income</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="afterschool_income"
                    // value={this.state.membership_name}
                    id="other_income"
                    placeholder="afterschool_income"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="afterschool_income_type">After School Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="afterschool_income_type" 
                    // value={this.state.membership_type}
                    id="afterschool_income_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="annual_income">Annual Gross Income</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="annual_income"
                    // value={this.state.membership_name}
                    id="annual_income"
                    placeholder="Annual Gross Income"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="annual_income_type">Annual Gross Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="annual_income_type" 
                    // value={this.state.membership_type}
                    id="annual_income_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              </Row>
            <hr/>
            <h5>Rersonal Goals</h5>
            <hr/>
            <Row>
              <Col sm="3">
              <div><Label for="personal_income">Personal Income</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="personal_income"
                    // value={this.state.membership_name}
                    id="personal_income"
                    placeholder="Personal Income"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="personal_income_type">Personal Income Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="personal_income_type" 
                    // value={this.state.membership_type}
                    id="personal_income_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="personal_save">Save</Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="personal_save"
                    // value={this.state.membership_name}
                    id="personal_save"
                    placeholder="Save"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
              <div><Label for="save_type">Save Category</Label></div>
                <FormGroup className="form-label-group">
                  <CustomInput 
                    type="select" 
                    name="save_type" 
                    // value={this.state.membership_type}
                    id="save_type" 
                    onChange={this.changeHandler}>
                      <option>Select</option>
                      <option>Weekly Goal</option>
                      <option>Monthly Goal</option>
                      <option>Quaterly Goal</option>
                      <option>Annual Goal</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              </Row>
            <hr/>
            <Row>
              <Col sm="12">
                <FormGroup className="form-label-group" style={{textAlign: 'right'}}>
                  <Button.Ripple
                    color="primary"
                    type="submit"
                    className="mr-1 mb-1"
                  >
                    Save
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
  return {shop : state.shop};
}
export default connect(mapStateToProps, {setSetting})(FloatingLabels)
