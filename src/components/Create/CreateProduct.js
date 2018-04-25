import React, {Component} from 'react';
import {Button,
        Form,
        FormGroup,
        FormText,
        Label,
        Input,
        InputGroup,
        InputGroupText,
        InputGroupAddon
      } from 'reactstrap';
import InputList from '../InputList/InputList';
import './CreateProduct.css';
const {ipcRenderer} = window.require('electron');

class CreateProduct extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleSubmitInputList = this.handleSubmitInputList.bind(this);
    this.state = {
      path:'',
      isBulkCreate: true,
      buttonName: 'Manual Create Product' // buttonName for toggle button
    }
  }
  handleChange(files) {
    console.log(files[0]);
    this.setState({
      path: files[0].path
    });
    // if it is not .xlsx format it should return error
    // this.props.onImportExcel(files[0].path);
    // console.log(this.props.history.push('/Search')); // push to router history
  }

  //TODO: Handling non .xlxs file
  handleClick(e) {
    e.preventDefault();

    // path is a string
    if(this.state.path.length > 0){
      ipcRenderer.send('bulk-import', {path:this.state.path});
      ipcRenderer.on('reply-bulk-import', (event,arg) => {
        let {status,message} = arg;
        if(status === 'OK') {
          console.log('Success');
        } else {
          console.log(message);
        }
      });
    }

  }

  handleToggleClick() {
    this.setState({
      isBulkCreate: !this.state.isBulkCreate,
      buttonName: (this.state.buttonName === 'Manual Create Product') ? 'Import Excel' : 'Manual Create Product'
    });
  }

  handleSubmitInputList(state) {
    let{inputList} = state;
    inputList.forEach((inputObj) => {
      console.log(inputObj);
    });
    ipcRenderer.send('create-product',{product_arr: inputList});
    ipcRenderer.on('reply-create-product', (event,arg) => {
      let {status,message} = arg;
      if(status === 'OK') {
        console.log(message);
      } else {
        console.log(message);
      }
    });

  }

  render() {
    let {isBulkCreate,buttonName} = this.state;
    let toogle = () => {
      if(isBulkCreate) {
        return (
          <FormGroup>
            <Label for="excelImport">File</Label>
            <Input type="file" innerRef="import" onChange={(e) => this.handleChange(e.target.files)} name="file" id="excelImport"/>
            <FormText color="muted">
              Find Excel Sheet to import to the database
            </FormText>
            <Button onClick={this.handleClick}>Import!</Button>
          </FormGroup>
        )
      } else {
        return (
          <InputList onSubmitInputList={this.handleSubmitInputList}
                     insideCreate={'product'}
                     inputField={{code:'', amount:0, price:0,brand:''}}/>
        )
      }
    }
    return (
      <Form className="form-product">
        <Button onClick={this.handleToggleClick}>{buttonName}</Button>
        {toogle()}
      </Form>
    )
  }
}

export default CreateProduct;
