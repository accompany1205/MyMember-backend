import React from "react"
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
} from "reactstrap"
import { Edit } from "react-feather"

import EditModal from "./editForm";

class ModalForm extends React.Component {
    state = {
        activeTab: "1",
        modal: false
    }

    toggleTab = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({ activeTab: tab })
        }
    }

    toggleModal = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }))
    }

    render() {
        const { userinfo } = this.props
        return (
            <React.Fragment>
                <Edit size="15" color="#fff" onClick={this.toggleModal} />
                <Modal
                    isOpen={this.state.modal}
                    toggle={this.toggleModal}
                    className="modal-dialog-centered modal-lg"
                >
      {console.log("--------",this.state.modal)}

                    <ModalHeader toggle={this.toggleModal}>
                        Edit Membership
                    </ModalHeader>
                    <ModalBody>
                        <EditModal toggle={this.toggleModal} userinfo={userinfo} />
                    </ModalBody>

                </Modal>

            </React.Fragment>
        )
    }
}
export default ModalForm
