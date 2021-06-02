import React, { Component } from "react";
import { render } from "react-dom";

import { saveAs } from "file-saver";
import {
  Document,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  Media,
  Packer,
  Paragraph,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
} from "docx";
import {Button} from "reactstrap"
import {Download, Upload} from "react-feather";

class SampleDocx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "React"
    };
  }



  async generateFromUrl() {
    const doc = new Document();
    // const blob = await fetch(
    //   ""
    // ).then(r => r.blob());

    const image1 = Media.addImage(doc);

    doc.addSection({
      children:
      [
        new Paragraph("name=${name}, 	belt size=${belt_size}, program=${program}, email=${email}, phone= ${primary_no}, DOB= ${DOB},Current rank=${current_rank}, Next rank=${next_rank}, Age=${age}")
      ]
    });

    Packer.toBlob(doc).then(blob => {
      console.log(blob);
      saveAs(blob, "example.docx");
      console.log("Document created successfully");
    });
  }

  render() {
    return (
      <div>
        <Button
          color="info"
          style={{padding:"0.6rem 1rem", marginLeft:"10px", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center"}}
          onClick={this.generateFromUrl}
        >
          <Download size={15} strokeWidth={3} style={{marginRight: 10,}}/>
          Download Sample Document
        </Button>

      </div>
    );
  }
}

export default SampleDocx;
