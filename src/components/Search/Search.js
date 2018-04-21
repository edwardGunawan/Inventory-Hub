import React, {Component} from 'react';
import ShowTable from '../ShowTable/ShowTable';
import {Progress,
        Input
        } from 'reactstrap';
import './Search.css';
import debounce from 'lodash/debounce';

const lunr = window.require('lunr');
let {ipcRenderer} = window.require('electron');



class Search extends Component {
  constructor(props) {
    super(props);
    this.handleClickAction = this.handleClickAction.bind(this);
    // debouncing
    this.handleSearch = debounce(this.handleSearch,500);
    this.state = {
      toRender:null
    }
  }
  componentWillMount() {
    // debounce
    // this.handleSearch= debounce(this.handleSearch,500)
    console.log('Go through component Will Mount in Search');
    ipcRenderer.send('show', 'Initialized');
    ipcRenderer.on('reply-show', (event,arg) => {
      let {status, message} = arg;
      if(status === 'OK') {
        // console.log(message);
        // importing lunr through here in component will mount
        let idx = lunr(function() {
          this.ref('id')
          this.field('code')
          this.field('amount')
          this.field('price')

          message.forEach(function(product) {
            this.add(product)
          },this)
        });
        this.setState({
          idx,
          message,
          toRender:message
        });
      }else {
        console.log(message);
      }
    })
  }

  handleClickAction(idx,actionButton) {
    console.log('click', idx, actionButton);
    this.setState({
      toRender:null
    }); // to load progress

    // fake timer for now
    setTimeout(() => {
      this.setState({
        toRender:this.state.message
      })
    },5000)
    // TODO:
    // Delete from IPCRenderer
    // render back to state for product
  }

  // making onSearch as a regular function, not an event listener
  // then call handleSearch through debounce that is in ctor
  onSearch = (val) => {
    // console.log(e.target.val);
    this.handleSearch(val);

  };

  handleSearch = (val) => {
    // console.log(val, 'in handleSearch');
    if(val.length > 0) {
      // console.log(this.state.idx);
      let {idx, message} = this.state;
      let res = idx.search(`${val}`);
      let firstIdx = res[0];
      let toRender = res.map((item) => {
        let {ref} = item;
        for(let {id,code,amount,price} of message) {
          // NOTE: ref is object and id is number type
          if(Number(ref) === id) {
            return {
              id,
              code,
              amount,
              price
            }
          }
        }
      });
      this.setState({
        toRender
      });
    } else {
      this.setState({
        toRender: this.state.message
      });
    }

  }


  render() {
    let{options} = this.props;
    let {toRender} = this.state;
    // console.log(toRender);
    return (
      <div>
        {options}
        <Input type="text" placeholder="search" onChange={(e) => this.onSearch(e.target.value)}/>
        <div className="progress-table-container">
          {(toRender) ? <ShowTable options={options} onClickAction={this.handleClickAction} products={toRender}/>:
            <Progress animated color="info" value="100"/> }
        </div>
      </div>
    )
  }
}

export default Search;
