import React from "react"
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  
} from "reactstrap"
import { Plus} from "react-feather"
import TestTabs from "./TestTabs"
import TestDate from "./testdate"
import axios from "axios"
const baseUrl = process.env.REACT_APP_BASE_URL;
const getUserId = () => {
  return localStorage.getItem("user_id")
}
class ModalForm extends React.Component {
  constructor(props) {
    super(props);
    this.toggleCloseAxios = this.toggleCloseAxios.bind(this);
  }
  state = {
    modal : false,
    modal_test: false
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

  toggleCloseAxios = (examdate) => {
      let k = this , list=[];
      k.props.testStudents.forEach(element => {
        list.push({
          stdList: element._id,
          start_date: examdate
        })
      });
      axios.post(`${baseUrl}/api/test/add_student_list/${getUserId()}`, list, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          'content-type': 'application/json'
        }
      })
      .then(function (response) {
        console.log(response);
        k.setState( prevState => ({
          modal: true,
          modal_test:false
        }))
      })
      .catch(function (error) {
        console.log(error);
      })

  }

  toggleExitTestModal = () => {
    this.setState(prevState => ({
      modal : false
    }))
  }

  render() {
    return (
      <React.Fragment>
                 
                <Button 
                className="btn-lg fides3 btn waves-effect waves-light"
                onClick={this.toggleModal}>
                  <Plus size={21} />
                  <br></br>
                  Test
                </Button>
                <Modal 
                  isOpen={this.state.modal_test}
                  className="modal-dialog-centered modal-mg"
                  toggle={this.toggleModal}
                >
                  <ModalHeader toggle={this.toggleModal}>
                    Are you sure you want to add the Test users to the Test list?
                  </ModalHeader>
                  <ModalBody>
                    <TestDate testmodal={this.toggleCloseAxios}/>
                  </ModalBody>
                </Modal>
              
                <Modal
                  isOpen={this.state.modal }
                  toggle={this.toggleModal}
                  className="modal-dialog-centered modal-lg"
                >
                    <ModalHeader toggle={this.toggleExitTestModal}>
                        The following student have been selected for promotion. Please promote rank.
                    </ModalHeader>
                    <ModalBody >
                    <TestTabs testStudents={this.props.testStudents} />
                    </ModalBody>
                </Modal>
        </React.Fragment>
    )
  }
}
export default ModalForm
