import React from "react"
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap"
import NewCategory from "./createFolderForm"
import {Plus} from "react-feather";


class ModalForm extends React.Component {
  state = {
    hover: false,
    modal: false
  }



  toggleModal = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }))
  }

  render() {
    return (
      <React.Fragment>


            <li
              onMouseEnter={() => this.setState({hover: true})}
              onMouseLeave={() => this.setState({hover: false})}
              style={{
                listStyle: "none", paddingBottom: "10px", cursor:"pointer", marginLeft: 24, color: `${this.state.hover ? "#00A6E1" : "#626262"}`}}
              onClick={this.toggleModal}
            >

              <Plus size="18" strokeWidth={5} style={{paddingBottom: "4px", height: "25px"}} /><span style={{fontWeight: 700, fontSize: 16}}> New Folder</span>

            </li>
            <Modal
              isOpen={this.state.modal}
              toggle={this.toggleModal}
              className="modal-dialog-centered"
            >
                <ModalHeader toggle={this.toggleModal}>
                Add New Folder
                </ModalHeader>
                <ModalBody>
                   <NewCategory toggle={this.toggleModal}/>
                </ModalBody>

            </Modal>

        </React.Fragment>
    )
  }
}
export default ModalForm
