import React from "react"
import {
  Card,
  CardHeader,
  CardBody,Row,Col,Button,
  Breadcrumb, BreadcrumbItem,
  Spinner
} from "reactstrap"
import DocImg from "../../../../assets/img/pages/box11.svg"
// import MergeImg from "../../../../assets/img/pages/marge.png"
import StudentModal from "./studentListModal"
import SampleDocxButton from "./sampleDocx"
import UploadDocxButton from "./documentUploadModal"
import {connect} from "react-redux";
import {Get_DocFolder_LIST, LIST_DOCUMENTS, DOCUMENTS_LOADING} from "../../../../redux/actions/document/document";
import {Trash} from "react-feather";


class DocumentsList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      rootFolder: "",
    };
  }
  componentDidMount() {
    this.props.LIST_DOCUMENTS();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.documentSubFolderList){
      if (prevProps.documentSubFolderList) {
        if (prevProps.documentSubFolderList._id !== this.props.documentSubFolderList._id) {
          // Update only if subfolder changes
          let subFolderId = this.props.documentSubFolderList._id;
          this.props.documentFolderList.forEach((folder) => {
            folder.subFolder.forEach((subFolder) => {
              if (subFolder._id === subFolderId) {
                this.setState({
                  rootFolder: folder.folderName,
                });
              }
            });
          });
        }
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.rootFolder !== "" && !this.props.documentsLoading && (
          <>
            <Breadcrumb>
              <BreadcrumbItem>All Folders</BreadcrumbItem>
              <BreadcrumbItem>{this.state.rootFolder}</BreadcrumbItem>
              <BreadcrumbItem>{this.props.documentSubFolderList.subFolderName}</BreadcrumbItem>
            </Breadcrumb>
            <Row style={{paddingBottom:"30px",paddingTop:"1rem"}}>
              <Col style={{display:"flex", justifyContent:"flex-start"}}>

                <UploadDocxButton />
                <SampleDocxButton/>
              </Col>

            </Row>
            <div style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}>
              <div style={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
                {this.props.uploadDocument && this.props.uploadDocument.length > 0 &&
                this.props.uploadDocument.map((doc) => {
                  return(<Card style={{
                    padding:"1rem",
                    backgroundColor:"rgb(140 139 139 / 24%)",
                    width: 160,
                    marginLeft: 12,
                    marginRight: 12,
                    marginBottom: 51,
                  }}
                               onClick={() => {
                                 window.open(doc.document , "_blank");
                               }}
                  >
                    <img src={DocImg} />
                    <span style={{textAlign: 'center'}}>{doc.document_name}</span>
                  </Card>);
                })}
              </div>

            </div>
          </>
        )}

        {this.state.rootFolder === "" && !this.props.documentsLoading && (
          <>
            No Folder Selected
          </>
        )}
        {this.props.documentsLoading && (
          <>
           <Spinner />
          </>
        )}

        </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.document,
  }
}

export default connect(mapStateToProps, { LIST_DOCUMENTS, DOCUMENTS_LOADING })(DocumentsList);
