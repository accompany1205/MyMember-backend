import React from "react"
import { Card, CardHeader, CardBody, CardTitle } from "reactstrap"
import { EditorState } from "draft-js"
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import "../../../assets/scss/plugins/extensions/editor.scss"

class EditorControlled extends React.Component {
  state = {
    editorState: EditorState.createEmpty()
  }

  onEditorStateChange = editorState => {
    this.setState({
      editorState
    })
  }

  render() {
    const { editorState } = this.state

    return (
      
          <Editor
            editorState={editorState}
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            onEditorStateChange={this.onEditorStateChange}
          />
        
    )
  }
}

export default EditorControlled
