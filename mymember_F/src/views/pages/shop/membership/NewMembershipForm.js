import React from "react"
import {
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Row,
  Col,
  Input,
  Form,
  Button,
  Label, CustomInput
} from "reactstrap"

// import Checkbox from "../../../../components/@vuexy/checkbox/CheckboxesVuexy"
// import img from "../../../../assets/img/pages/1-apex.png"
import { Check } from "react-feather";
import { connect } from 'react-redux';
import { createMembership } from '../../../../redux/actions/shop/index';
import "../../../../assets/scss/pages/users.scss"
import img from "../../../../assets/img/pages/1-apex.png"
import '../../../../assets/scss/pages/shop.scss';
import { cssNumber } from "jquery";
class FloatingLabels extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      membership_name: "",
      color: "#fffee",
      membership_type: "",
      duration_time: "0",
      duration_type: "",
      total_price: "0",
      down_payment: "0",
      payment_type: "weekly",
      balance: "",
      payment_time: "0",
      payments_types: "month",
      pay: "",
      due_every: '1st',
      membership_profile: "",
    }

    this.changeHandler = this.changeHandler.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.shop.membershipList.length > prevProps.shop.membershipList.length) {
      this.props.toggle();
    }
  }


  changeHandler(e) {
    this.setState({ ...this.state, [e.target.name]: e.target.value }, () => {
      var total_price = Number(this.state.total_price)
      var down_payment = Number(this.state.down_payment)
      var balance_amount = total_price - down_payment
      var duration = Number(this.state.payment_time)
      var installment = balance_amount / duration === "NaN" ? "" : balance_amount / duration
      this.setState({ balance: String(balance_amount), pay: String(installment) })
    });
  }

  setProfile = (e) => {
    const value = e.target.files[0]
    this.setState({ membership_profile: value })
  }

  onsubmit = (e) => {
    e.preventDefault();
    // console.log(this.state)
    this.props.createMembership(this.state);
  }

  render() {
    return (
      <Card>
        <CardHeader>
          {/* <CardTitle>Vertical Form With Floating Labels</CardTitle> */}
        </CardHeader>
        <CardBody>
          <Form className="mt-10" onSubmit={this.onsubmit}>
            <Row>
              <Col sm="6">
                <div><Label for="nameFloating">Membership Name<sup>*</sup></Label></div>
                <FormGroup className="form-label-group">
                  <Input
                    type="text"
                    name="membership_name"
                    value={this.state.membership_name}
                    id="nameFloating"
                    placeholder="Membership Name"
                    onChange={this.changeHandler}
                    required
                  />
                </FormGroup>
              </Col>
              <Col sm="6">
                <FormGroup className="form-label-group">
                  <div>
                    <Label> Membership Type <sup>*</sup></Label>
                  </div>
                  <CustomInput type="select" name="membership_type" value={this.state.membership_type} id="status" onChange={this.changeHandler} required>
                    <option>Select Membership Type </option>
                    <option>Little Tigers </option>
                    <option>Taekwondo </option>
                    <option>Kickboxing </option>
                    <option>Tasma </option>
                    <option>Teen & Adult </option>

                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="6">
                <FormGroup className="form-label-group">
                  <div><Label for="nameFloating">Duration <sup>*</sup></Label></div>
                  <Input
                    type="text"
                    name="duration_time"
                    value={this.state.duration_time}
                    id="durationFloating"
                    placeholder="Please Specify Year"
                    onChange={this.changeHandler}
                    required
                  />
                </FormGroup>
              </Col>
              <Col sm="6">
                <FormGroup className="form-label-group">
                  <div><Label>Months  <sup>*</sup></Label></div>
                  <CustomInput
                    type="select"
                    name="duration_type"
                    value={this.state.duration_type}
                    onChange={this.changeHandler}
                    id="status"
                    required>
                    <option value="month">Months(s) </option>
                    <option value="week">Week(s) </option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="6">
                <FormGroup className="form-label-group">
                  <div><Label for="passwordFloating">Total Price</Label></div>
                  <Input
                    type="number"
                    name="total_price"
                    value={this.state.total_price}
                    onChange={this.changeHandler}
                    onBlur={this.calculateBalanceAmount}
                    onFocus={this.calculateBalanceAmount}
                    id="PriceFloating"
                    placeholder="Total Price"
                  />
                </FormGroup>
              </Col>
              <Col sm="6">
                <FormGroup className="form-label-group">
                  <div><Label for="nameFloating">Down Payment</Label></div>
                  <Input
                    type="number"
                    name="down_payment"
                    value={this.state.down_payment}
                    onChange={this.changeHandler}
                    id="paymentFloating"
                    placeholder="Down Payment"
                  />
                </FormGroup>
              </Col>
              <Col sm="6">
                <FormGroup>
                  <Row>
                    <div className="col-md-6 co-sm-12 col-xs-12">
                      <div><label> Payment Type</label></div>
                    </div>
                    <div className="col-md-6 co-sm-12 col-xs-12">
                      <div className="col-md-12 co-sm-12 col-xs-12">
                        <input type="radio"
                          id="periph1"
                          name="payment_type"
                          value="pif"
                          checked={this.state.payment_type === "pif"}
                          onChange={this.changeHandler}
                        />
                        <label for="periph1">PIF</label>
                      </div>
                      <div className="col-md-12 co-sm-12 col-xs-12">
                        <input type="radio"
                          id="periph2"
                          name="payment_type"
                          value="monthly"
                          checked={this.state.payment_type === "monthly"}
                          onChange={this.changeHandler}
                        />
                        <label for="periph1">Monthly</label>
                      </div>
                      <div className="col-md-12 co-sm-12 col-xs-12">
                        <input type="radio"
                          id="periph3"
                          name="payment_type"
                          value="weekly"
                          checked={this.state.payment_type === "weekly"}
                          onChange={this.changeHandler}
                        />
                        <label for="periph1">Weekly</label>
                      </div>
                    </div>
                  </Row>
                </FormGroup>
              </Col>
              <Col sm="6">
                <FormGroup className="form-label-group">
                  <div><Label for="BalanceFloating">Balance</Label></div>
                  <Input
                    type="number"
                    name="balance"
                    value={this.state.balance}
                    id="BalanceFloating"
                    placeholder="Balance"
                  />
                </FormGroup>
              </Col>

              <Col sm="3">
                <FormGroup className="form-label-group">
                  {/* <img src={img} width="100px"/> */}
                  <div><Label for="PaymentsFloating">Payments</Label></div>
                  <Input
                    type="text"
                    name="payment_time"
                    value={this.state.payment_time}
                    onChange={this.changeHandler}
                    id="paymentsFloating"
                    placeholder="Duration"
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
                <FormGroup className="form-label-group">
                  <div><Label> Monthly </Label></div>
                  <CustomInput
                    type="select"
                    name="payments_types"
                    value={this.state.payments_types}
                    onChange={this.changeHandler}
                    id="profiletype">
                    <option value="month">Month(s)</option>
                    <option value="week">Week(s)</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="3">
                <FormGroup className="form-label-group">
                  {/* <img src={img} width="100px"/> */}
                  <div><Label for="dollerFloating">Of $</Label></div>
                  <Input
                    type="text"
                    name="pay"
                    value={this.state.pay}
                    id="dollerFloating"
                    placeholder="$"
                    onChange={this.changeHandler}
                  />
                </FormGroup>
              </Col>
              <Col sm="3">
                <FormGroup className="form-label-group">
                  <div><Label> Due Every </Label></div>
                  <CustomInput type="select" name="due_every" value={this.state.due_every} onChange={this.changeHandler} id="Due">
                    <option>1st</option>
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                    <option>25</option>
                    <option>30</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group upload-img-group">
                  <img src={!!this?.state?.membership_profile ? URL.createObjectURL(this?.state?.membership_profile) : img} alt={img} width="40px" height="40px" />
                  <Input
                    type="file"
                    name="membership_profile"
                    onChange={this.setProfile}
                    id="fileFloating"
                    placeholder="Program Name"
                  />
                  {/* <Label for="nameFloating">Program Image</Label> */}
                </FormGroup>
              </Col>
              <Col sm="6">
                <FormGroup className="form-label-group">
                  <Row>
                    <div className="col-md-3 col-sm-12 col-xs-12">
                      <Label for="nameFloating">color</Label>
                    </div>
                    <div className="col-md-9 col-sm-12 col-xs-12">
                      <input
                        type="color"
                        id="colorFloating"
                        className="npt-1"
                        name="color"
                        value={this.state.color}
                        onChange={this.changeHandler}
                      />
                    </div>
                  </Row>
                </FormGroup>
              </Col>
              <Col sm="12">
                <FormGroup className="form-label-group">
                  <Button.Ripple
                    color="primary"
                    value={this.state.color}
                    type="submit"
                    className="mr-1 mb-1"
                    onSubmit={this.onsubmit}
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
  return { shop: state.shop };
}
export default connect(mapStateToProps, { createMembership })(FloatingLabels)
