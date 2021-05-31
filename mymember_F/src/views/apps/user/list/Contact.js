import React from "react"
import {
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Input
 
} from "reactstrap"
import { Phone} from "react-feather"
import axios from "axios"
import { RadioGroup } from "@material-ui/core"
const baseUrl = process.env.REACT_APP_BASE_URL;
const getUserId = () => {
  return localStorage.getItem("user_id")
}

class contactModal extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
        name: "React",
        modal : false,
        modal_test: false,
        contact: ""
    };
    this.onChangeValue = this.onChangeValue.bind(this);  
    }
    onChangeValue(event) {
        this.setState({contact: event.target.value});
    }
    toggleModal = () => {
        if (this.props.testStudents.length == 0 ){
            this.setState(prevState => ({
                modal: !prevState.modal
            }))
        } else {
            this.setState(prevState => ({
                modal_test: !prevState. modal_test
            }))
        }
    }

    contactAdd = () => {
       let k = this , list=[];
       k.props.testStudents.forEach(element => {
         list.push({
            studentId: element._id,
            contact_type: k.state.contact
         })
       });
       axios.post(`${baseUrl}/api/create_contact_email_list/${getUserId()}`, list, {
         headers: {
           "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
           'content-type': 'application/json'
         }
       })
       .then(function (response) {
         console.log("response");
        
       })
       .catch(function (error) {
         console.log(error);
       })
    }

  render() {
    return (
            <React.Fragment>
                <Button
                    className="btn-lg fides5 btn waves-effect waves-light"
                    onClick={this.toggleModal}>
                    <Phone size={21} />
                    <br></br>
                    Contact
                </Button>
                <Modal 
                  isOpen={this.state.modal_test}
                  className="modal-dialog-centered modal-mg"
                  toggle={this.toggleModal}
                >
                  <ModalHeader toggle={this.toggleModal}>
                    Are you sure you want to add Contact?
                  </ModalHeader>
                  <ModalBody>
                    <Row onChange={this.onChangeValue}>
                        <Col className="text-align:center">
                            <input type="radio" value="Text"  name="contact"/>Text
                        </Col>
                        <Col className="text-align:center">
                            <input type="radio" value="Email" name="contact"/>Email
                        </Col> 
                    </Row>
                        <br/>
                    <Row className="pt-30px">
                        <Button
                            size="md"
                            color="primary"
                            className="mx-auto"
                            onClick={this.contactAdd}
                        >
                         Yes
                        </Button>
                        <Button
                            size="md"
                            color="primary"
                            className="mx-auto"
                        >
                         No
                        </Button>
                    </Row>
                  </ModalBody>
                </Modal>
            </React.Fragment>
        
    )
  }
}
export default contactModal
