import React from "react"
import {
    Card,
    CardHeader,
    CardBody, Row, Col, Button
} from "reactstrap"
import BuyNowModal from "./buyNowModal"
import { Edit, Trash, Trash2 } from "react-feather"
import EditModal from "./editMembershipModal";

import { connect } from 'react-redux';
import { getMembership, trashMembership, getStudentsList, getMembershipInfo } from '../../../../redux/actions/shop';

class AllMembershipList extends React.Component {

    state = {
        modal: false
    }

    componentDidMount() {
        this.props.getMembership();
        this.props.getStudentsList();
    }

    toggleModal = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }))
    }

    render() {
        return (
            <React.Fragment>
                <Row>

                    <Col>
                        <br></br>
                        <h6> All Membership</h6>
                        <br></br>
                    </Col>
                </Row>
                <Row>
                    {this.props.shop?.membershipList.length > 0 &&
                        this.props.shop?.membershipList.reverse().map((v, i) => <Col lg="3" md="12" key={v._id}>

                            <Card>
                                <CardHeader style={{ background: "black", padding: "5px 10px" }} >
                                    <h6 style={{ color: "#fff", margin: "0", fontWeight: "500", fontSize: "16px" }}>{v.membership_name}</h6>
                                    <div>
                                        <EditModal userinfo={v} />
                                        <Trash size="15" color="#fff"
                                            onClick={e => {
                                                e.stopPropagation()
                                                this.props.trashMembership(v._id)
                                            }}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody style={{ padding: "10px" }}>
                                    <Row>
                                        <Col><p>Duration:</p></Col>
                                        <Col>{`${v.duration_time}${v.duration_type}`}</Col>
                                    </Row>
                                    <Row>
                                        <Col><p>Price:</p></Col>
                                        <Col>$&nbsp;{v.total_price}</Col>
                                    </Row>
                                    <Row>
                                        <Col><p>Payment Type:</p></Col>
                                        <Col><p>{v.payment_type}</p></Col>
                                    </Row>
                                    <Row>
                                        <Col></Col>
                                        <Col> <BuyNowModal memberShipDetail={v} studentList={this.props.shop.studentList} type={"student_profile"} info={this.props.getMembershipInfo(v._id)} /> </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>)}
                </Row>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        shop: state.shop
    }
}

export default connect(mapStateToProps, { getMembership, trashMembership, getStudentsList , getMembershipInfo})(AllMembershipList);