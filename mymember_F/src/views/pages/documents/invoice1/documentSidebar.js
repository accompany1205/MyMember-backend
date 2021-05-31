import React from "react"
import { UncontrolledCollapse, Card, CardHeader, CardTitle, CardBody, Row } from "reactstrap"
import { Plus, FolderMinus, FolderPlus, Folder } from "react-feather"
import NewFolder from "./createFolderModal";
import { Get_DocFolder_LIST, LIST_DOCUMENTS } from '../../../../redux/actions/document/document';
import { connect } from 'react-redux';
import NewSubFolder from './createSubFolderModal'



class CollapseUncontrolled extends React.Component {

  constructor(props){
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.Get_DocFolder_LIST();
  }

  viewDocumentList(folderId) {
    this.props.LIST_DOCUMENTS(folderId);
  }

  render() {
    return (
      <React.Fragment>
        <Card style={{ paddingBottom: "3rem", backgroundColor: "#c1c1c126", paddingTop: "0.5rem" }}>
          <Row style={{
            justifyContent: "flex-start",
            textAlign: "center",
            marginTop: "10px",
            marginLeft: "24px",
            alignItems: "center" }} >
            <div style={{height: 21}}>
              <p>Folders</p>
            </div>
            <div style={{
              marginLeft: "auto",
              marginRight: "32px",
            }}>
              <NewFolder />
            </div>
          </Row>

          {this.props.documentFolderList && this.props.documentFolderList.length > 0 &&
            this.props.documentFolderList.sort().map((v, i) =>

              <div className="vx-collapse collapse-bordered collapse-icon accordion-icon-rotate" >
                <CardHeader id={"f"+v._id} style={{ paddingTop: "0.6rem" }} onClick={() => {
                    this.setState({
                      ...this.state,
                      ["f" + v._id]: !this.state["f" + v._id],
                    });
                  }
                }>
                  <CardTitle className="lead collapse-title collapsed">

                    {this.state["f" + v._id] ? (<FolderMinus size="18" />) : (<FolderPlus size="18" />)} {v.folderName}
                  </CardTitle>
                </CardHeader>
                <UncontrolledCollapse id={"uc"+v._id} toggler={"#f"+v._id}>

                  <CardBody style={{ padding: "0" }} >
                      <ul style={{marginBottom:"0"}}>
                      {v.subFolder?.map((subFolder, _i) =>
                        <li style={{ listStyle: "none", paddingBottom: "10px", cursor: "pointer" }} onClick={() => this.viewDocumentList(subFolder._id)}>
                          <Folder size="14" /> {subFolder.subFolderName}
                        </li>

                        )}

                        <NewSubFolder
                         isSubFolder={true}
                         mainFolder={v}
                        />
                      </ul>


                  </CardBody>


                </UncontrolledCollapse>

              </div>
            )}
        </Card>

      </React.Fragment>

    )
  }
}
const mapStateToProps = (state) => {
  return {
    ...state.document,
  }
}
// export default CollapseUncontrolled
export default connect(mapStateToProps, { Get_DocFolder_LIST, LIST_DOCUMENTS })(CollapseUncontrolled);
