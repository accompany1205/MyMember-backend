import React from "react"
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap"
import {Plus} from "react-feather"
import NewCategory from "./createSubFolder"
import { connect } from 'react-redux';
import { Get_DocFolder_LIST } from '../../../../redux/actions/document/document';

class ModalForm extends React.Component {
  state = {
    modal: false,
    hover: false,
  }

  componentDidMount() {
    this.props.Get_DocFolder_LIST();

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
                listStyle: "none", marginBottom: 4, marginRight: 24, paddingTop: 4, cursor:"pointer", color: `${this.state.hover ? "#00A6E1" : "#626262"}`}}
                onClick={this.toggleModal}
                >

              <Plus size="14" strokeWidth={5} style={{paddingBottom: "4px", height: "25px"}}/> <span style={{fontWeight: 700}}>New Sub Folder</span>

            </li>
            <Modal
              isOpen={this.state.modal}
              toggle={this.toggleModal}
              className="modal-dialog-centered"
            >
                <ModalHeader toggle={this.toggleModal}>
                Sub Folder Management
                </ModalHeader>
                <ModalBody>
                   <NewCategory
                   toggle={this.toggleModal}
                   mainFolder={this.props.mainFolder}
                   isSubFolder={this.props.isSubFolder}
                   />
                </ModalBody>

            </Modal>

        </React.Fragment>
    )
  }
}
// export default ModalForm
const mapStateToProps = (state) => {
  return {
    documentFolderList: state.documentFolderList
  }
}
export default connect(mapStateToProps, { Get_DocFolder_LIST })(ModalForm);

