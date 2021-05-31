import React from "react"
import {
    Row,
    Button,
    Input
} from "reactstrap"

class TestDate extends React.Component {

    constructor(props){
        super(props);
        
        this.state = {
          examdate : ''
        }
        
        this.updateInput = this.updateInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
          
    updateInput(event){
         this.setState({examdate : event.target.value})
    }
         
    handleSubmit(){
        console.log('Your input value is: ' + this.state.examdate)
        //Send state to the server code
    }
        
    render() {
        return (   
           <div>
               <Row>
                   <Input 
                    type="date"
                    placeholder="Enter test date"
                    className="mx-auto w-75 align-items:center"
                    onChange={this.updateInput}
                   >
                   </Input>
               </Row>
               <br/>
               <Row className="pt-30px">
                   <Button
                   size="md"
                   color="primary"
                   className="mx-auto"
                    onClick={()=>this.props.testmodal(this.state.examdate)}
                   >
                        Yes
                   </Button>
                   <Button

                   size="md"
                   color="primary"
                   className="mx-auto"
                   onClick={this.props.toggle}
                   >
                        No
                   </Button>
               </Row>
           </div> 
        )

    }
    
}
export default TestDate