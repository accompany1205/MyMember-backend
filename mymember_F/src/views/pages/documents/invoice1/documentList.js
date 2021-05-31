import React from "react"
import {
  Card,
  CardHeader,
  CardBody,Row,Col,Button
} from "reactstrap"
import DocImg from "../../../../assets/img/pages/box11.svg"
// import MergeImg from "../../../../assets/img/pages/marge.png"
import StudentModal from "./studentListModal"
import SampleDocxButton from "./sampleDocx"
import UploadDocxButton from "./documentUploadModal"
import {connect} from "react-redux";
import {LIST_DOCUMENTS} from "../../../../redux/actions/document/document";


class DocumentsList extends React.Component {
  componentDidMount() {
    this.props.LIST_DOCUMENTS();

  }
  render() {
    return (
      <React.Fragment>
        <Row  style={{paddingBottom:"30px",paddingTop:"1rem"}}>
          <Col sm="4" style={{display:"flex", justifyContent:"space-around"}}>

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

        </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.document
  }
}

export default connect(mapStateToProps, { LIST_DOCUMENTS })(DocumentsList);
