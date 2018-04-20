import React, {Component} from 'react';
import {
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  ListGroup,
  Form,
  FormGroup,
  Label,
  Input,
  Button
} from 'reactstrap';
import './InputList.css';

/*
  This Component will serve as Input List,
  Configuring all the input list, and adding to bulkCreate
  or Inout for a list of input
*/

class InputList extends Component {
   constructor(props) {
     super(props);
     this.handleAddItem = this.handleAddItem.bind(this);
     this.handleDeleteItem = this.handleDeleteItem.bind(this);
     this.handleInputChange = this.handleInputChange.bind(this);
     this.handleSubmit = this.handleSubmit.bind(this);
     this.state = {
       inputList: [this.props.inputField]
     }
   }

   // using concat to add element to not mutate it
   handleAddItem = () => {
     this.setState({
       inputList: this.state.inputList.concat(this.props.inputField)
     });
   }

   // using filter to remove element to not mutate it
   handleDeleteItem = (idx) => () => {
     this.setState({
       inputList: this.state.inputList.filter((currList,i) => i !== idx)
     });
   }

   // TODO: Handling incorrect value
   handleInputChange = (idx) => (evt) => {
     let {value,name} = evt.target;
     // console.log(evt.target.name,evt.target.value,idx);
     this.setState({
       inputList:this.state.inputList.map((currList, i) => {
         if(idx !== i) return currList;
         // this will create a new object with all the currList item
         // and the one that is updated
         return {...currList, [`${name}`]:value}
       })
     })
   }

   handleSubmit = (e) => {
     e.preventDefault();
     console.log(this.state.inputList);
     console.log('click handleSubmit');
     this.props.onSubmitInputList(this.state.inputList);
   }

  render() {
    // rendering input group and label over here
    let {inputList} = this.state;
    let {insideCreate} = this.props;
    let renderInput = (inputList) => {
      return inputList.map((item, idx) => {
        if(insideCreate) {
          let {code,amount,price} = item;
          return (
            <FormGroup className="formGroup-container" onChange={this.handleInputChange(idx)} key={idx}>
              <Label for={`code_${idx}`}>code</Label>
              <Input name="code" type="text" id={`code_${idx}`} placeholder="code"/>
              <Label for={`amount_${idx}`}>amount</Label>
              <Input name="amount" type="number" step="1" placeholder="amount" />
              <Label for={`price_${idx}`}>Price</Label>
              <Input name="price" type="number" placeholder="Price"/>
              <Button className="button-delete"onClick={this.handleDeleteItem(idx)}>Delete</Button>
            </FormGroup>
          );
        }else {
          return (
            <div>
              Inside In/Out Component
            </div>
          )
        }

      });
    }
    // adding scrollable div
    // let formStyle={overflowY:'auto', width:'100%', height:'500px',paddingBottom:'30px'};
    return (
      <div className="form-container" onSubmit={this.handleSubmit}>
        {renderInput(inputList)}
        <Button className="add-submit" onClick={this.handleAddItem}>Add</Button>
        <Button className="add-submit" onClick={this.handleSubmit}>Submit</Button>
      </div>
    )
  }
}


InputList.defaultProps = {
  insideCreate:true,
  inputField: {}
}
export default InputList;
