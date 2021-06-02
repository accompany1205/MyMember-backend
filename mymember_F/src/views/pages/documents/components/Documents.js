import React from "react"
import {
  Card,
  Row,
  Col
} from "reactstrap"
import Breadcrumbs from "../../../../components/@vuexy/breadCrumbs/BreadCrumb"
import DocumentsSidebar from "./documentSidebar"
import "../../../../assets/scss/pages/documents.scss"
import DocumnetListing from "./documentList"

class Documents extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Breadcrumbs
          breadCrumbTitle="Documents"
          breadCrumbParent="Pages"
          breadCrumbActive="Documents"
        />
        <Row>
          <Col sm="12" md="6" lg="5" xl="4">
            <DocumentsSidebar/>
          </Col>
          <Col sm="12" md="6" lg="7" xl="8">

            <DocumnetListing />
          </Col>
        </Row>
      </React.Fragment>
    )
  }
}

export default Documents
