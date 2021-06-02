import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Row,
  Button,
  UncontrolledTooltip,
  Collapse,
  Input
} from "reactstrap"
import { Plus, FolderMinus, FolderPlus, Folder, Trash, Edit} from "react-feather"
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
        <Card style={{ paddingBottom: "24px", backgroundColor: "#fff", paddingTop: "24px" }}>
          <Row style={{
            justifyContent: "flex-start",
            textAlign: "center",
            marginTop: "4px",
            marginBottom: "4px",
            marginLeft: "24px",
            marginRight: "24px",
            alignItems: "center" }} >
            <Input
              type="search"
              name="search"
              id="folderSearch"
              placeholder="Search Folder"
              style={{marginBottom: 24,}}
            />
            <div style={{height: "30px"}}><Folder size="20" style={{paddingBottom: "5px", height: "25px"}}/>
              <span style={{fontSize: 16.8, fontWeight: 700, color: "#2C2C2C", paddingLeft: 4}}>All Folders</span>
            </div>
            <div style={{
              marginLeft: "auto",
              marginRight: "32px",
            }}>
            </div>
          </Row>
          <div style={{marginLeft: "12px"}}>
            {this.props.documentFolderList && this.props.documentFolderList.length > 0 &&
            this.props.documentFolderList.sort().map((v, i) =>

              <div className="vx-collapse collapse-bordered collapse-icon accordion-icon-rotate" >
                <CardHeader id={"f-"+v._id} style={{ paddingTop: "0px", paddingBottom: "4px", paddingLeft: "24px", paddingRight: "36px" }} onClick={() => {
                    // Set other root and sub folder false
                    // NOTE: Avoid using f- prefix on any state name other than subfolder
                    let updatedState = {};
                    if (this.props.documentFolderList.length) {
                      Object.keys(this.state).forEach((key) => {
                        if (key.startsWith('f-')
                            || key.startsWith('sf-')) {
                          updatedState[key] = false;

                        }
                      });
                      this.setState({
                        ...this.state,
                        ...updatedState,
                      });
                    }
                    this.setState({
                      ["f-" + v._id]: !this.state["f-" + v._id],
                    });
                  }
                }>
                  <CardTitle className="lead collapse-title collapsed" style={{width: "100%"}}>
                    <div style={{display: "flex", justifyContent: "space-between",}}>
                      <div>
                        {this.state["f-" + v._id] ? (<FolderMinus size="18" style={{paddingBottom: "4px", height: "25px"}}/>) : (<FolderPlus size="18" style={{paddingBottom: "4px", height: "25px"}}/>)}
                        <span style={{paddingLeft: 4, fontWeight: `${this.state["f-" + v._id] ? 700:500}`, flex: 1, alignItems: "flex-start"}}>{v.folderName}</span>
                      </div>
                      <div style={{width: 64, minWidth: 64, height: 28, display: `${this.state["f-" + v._id] ?"flex" : "none"}`, justifyContent: "space-between"}}>
                        <Button color="primary" size="sm" id={"edit-f-" + v._id} style={{width: 28, padding: 0,}}><Edit size={12} /></Button>
                        <UncontrolledTooltip
                          placement="bottom"
                          target={"edit-f-" + v._id}
                        >
                          Edit
                        </UncontrolledTooltip>
                        <Button color="danger" size="sm" id={"delete-f-" + v._id} style={{width: 28, padding: 0,}}><Trash size={12} /></Button>
                        <UncontrolledTooltip
                          placement="bottom"
                          target={"delete-f-" + v._id}
                        >
                          Delete
                        </UncontrolledTooltip>
                      </div>
                    </div>

                  </CardTitle>
                </CardHeader>
                <Collapse isOpen={this.state["f-"+v._id]}>

                  <CardBody style={{ paddingTop: "4px",}} >
                    <ul style={{paddingBottom: 12, marginLeft: -12, paddingTop: 12, backgroundColor: "#F0F0F0", borderRadius: "0.5rem", }}>
                      {v.subFolder?.map((subFolder, _i) =>
                        <li style={{ listStyle: "none", paddingBottom: "8px", paddingRight: 14, cursor: "pointer",display: "flex", justifyContent: "space-between", }}>
                          <div
                            style={{
                              marginLeft: -12,
                            }}
                            onClick={() => {
                            // Set other sub folder false
                            // NOTE: Avoid using sf- prefix on any state name other than subfolder
                            let updatedState = {};
                            if (v.subFolder.length) {
                              Object.keys(this.state).forEach((key) => {
                                if (key.startsWith('sf-')) {
                                  updatedState[key] = false;
                                }
                              });
                              this.setState({
                                ...this.state,
                                ...updatedState,
                              });
                            }
                            this.setState({
                              ["sf-" + subFolder._id]: !this.state["sf-" + subFolder._id],
                            });
                            this.viewDocumentList(subFolder._id);
                          }}>
                            <Folder size="14" style={{paddingBottom: "4px", height: "25px"}} /> <span style={{fontWeight: `${this.state["sf-" + subFolder._id] ? 700:500}`}}> {subFolder.subFolderName}</span>
                          </div>
                          <div style={{width: 64, minWidth: 64,  height: 28, display: `${this.state["sf-" + subFolder._id] ?"flex" : "none"}`, justifyContent: "space-between"}}>
                            <Button color="primary" size="sm" id={"edit-sf-" + subFolder._id} style={{width: 28, padding: 0,}}><Edit size={12} /></Button>
                            <UncontrolledTooltip
                              placement="bottom"
                              target={"edit-sf-" + subFolder._id}
                            >
                              Edit
                            </UncontrolledTooltip>
                            <Button color="danger" size="sm" id={"delete-sf-" + subFolder._id} style={{width: 28, padding: 0,}}><Trash size={12} /></Button>
                            <UncontrolledTooltip
                              placement="bottom"
                              target={"delete-sf-" + subFolder._id}
                            >
                              Delete
                            </UncontrolledTooltip>
                          </div>
                        </li>

                      )}

                      <div style={{
                        marginLeft: -12,
                      }}>
                        <NewSubFolder
                          isSubFolder={true}
                          mainFolder={v}
                        />
                      </div>
                    </ul>


                  </CardBody>


                </Collapse>

              </div>
            )}
          </div>
          <NewFolder />
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
