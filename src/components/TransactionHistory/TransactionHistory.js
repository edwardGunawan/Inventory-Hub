import React, {Component} from 'react';
import Filter from '../Filter/Filter';
import PreviewTable from './PreviewTable';
import {
   ButtonDropdown,
   DropdownToggle,
   DropdownMenu,
   DropdownItem,
   Button } from 'reactstrap';
import {history} from '../Main/Main';
import './TransactionHistory.css';

const ipcRenderer = window.ipcRenderer;


class TransactionHistory extends Component {
  constructor(props) {
    super(props);
    this.init = this.init.bind(this);
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleRenderFilter = this.handleRenderFilter.bind(this);
    this.renderDates = this.renderDates.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      orderDates:{}, // from timestamps initOrderHistory
      customerHistoryDates:{}, // from timestamps init customerHistory
      productHistoryDates:{}, // from timestamps init productHistory
      transactionHistory:[], // the transactionHistory after search for the dates
      optionTitle: 'Options', // option title, customer, product, order
      filterResult:[], // the result that will convert to excel
      filterObj:{}, // filter field, and value from the filter underneath the dates
      dropdownOpen:false,
      tableHeader:[]
    }
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('transaction-history-init');
    ipcRenderer.removeAllListeners('reply-transaction-history-init');
    ipcRenderer.removeAllListeners('get-transaction');
    ipcRenderer.removeAllListeners('reply-get-transaction');
  }

  init() {
    ipcRenderer.send('transaction-history-init','');
    ipcRenderer.on('reply-transaction-history-init',(event,arg) => {
      let {message,status} = arg;
      if(status === 'OK') {
        // console.log('message in init', message);
        let {orderDates,customerHistoryDates,productHistoryDates} = message;
        this.setState({
          orderDates,
          customerHistoryDates,
          productHistoryDates
        });
      }else {
        console.log(message);
      }
      ipcRenderer.removeAllListeners('transaction-history-init');
      ipcRenderer.removeAllListeners('reply-transaction-history-init');
    });
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }

  select(evt) {
    this.setState({
      optionTitle: evt.target.innerText,
      transactionHistory:[]
    });
  }


  // trigger ipcMain getCustomerHistoryDetail, getProductHistoryDetail,
  // getPurchaseDetail
  // dates obj where there is start and end timestamps
  handleChangeDate(category) {
    return (dates) => {
      // console.log('dates in handleChangeDate', dates);
      ipcRenderer.send('get-transaction',{...dates,category});
      ipcRenderer.on('reply-get-transaction',(evt,data) => {
        let {status,message} = data;
        if(status === 'OK') {
          console.log('message in transactionHistory', message);
          const tableHeader = Object.keys(message[0]);
          this.setState({transactionHistory:message,tableHeader,filterResult:message});
        } else {
          console.log(message);
        }
        ipcRenderer.removeAllListeners('get-transaction');
        ipcRenderer.removeAllListeners('reply-get-transaction');
      })
    }
  }

  // sort action, brand, customer while user get choosing between them
  handleRenderFilter(arr){
    let actionOptions = [];
    let brandOptions = [];
    let customerOptions = [];
    let codeOptions = [];
    let set = new Set();
    console.log('arr in handleRenderFilter', arr);
    for(let {action,brand,customer,code} of arr) {
      if(!set.has(action)) {
        actionOptions.push({value:action, label:action});
      }
      if(!set.has(brand)) {
        brandOptions.push({value:brand, label:brand});
      }
      if(!set.has(customer)) {
        customerOptions.push({value:customer, label:customer});
      }

      if(!set.has(code)) {
        codeOptions.push({value:code, label:code});
      }
      set.add(action);
      set.add(brand);
      set.add(customer);
      set.add(code);
    }
    return {actionOptions,brandOptions,customerOptions,codeOptions};
  }


  /*
    handle all filter
    setState for filter
  */
  handleFilter(obj){
    let {filterObj} = this.state;
    Object.keys(obj).forEach((o) => {
      if(obj[o]){
        filterObj = {...filterObj,[o]:obj[o]};
      }else {
        delete filterObj[o];
      }
    });
    this.handleSearch(filterObj);
  }

  /*
    handleSearch
    loop through each transactionHistory
    filter based on brand
    filter based on customer
    filter based on action
    send it to showTable
  */
  handleSearch(filterObj) {
    const {transactionHistory} = this.state;
    let filterResult = [];

    let {code='all',customer='all',action='all'} = filterObj;
    console.log('go through handle Search ', code,customer,action);
    filterResult = transactionHistory.filter((obj) => {
      return code === 'all' || obj.code === code;
    });
    console.log('filterResult after brand', filterResult);
    filterResult = filterResult.filter((obj) => {
      return customer === 'all' || obj.customer === customer;
    });
    filterResult = filterResult.filter((obj) => {
      return action === 'all' || obj.action === action;
    });

    this.setState({
      filterResult,
      filterObj
    });
  }

  /*
    Render dates to Filter.js based on optionTitle
  */
  renderDates(optionTitle) {
    let dates=[];
    switch(optionTitle){
      case 'Order':
        dates = this.state.orderDates;
        break;
      case 'Product':
        dates = this.state.productHistoryDates;
        break;
      case 'Customer':
        dates = this.state.customerHistoryDates;
        break;
    }
    return dates;
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log('submit button', e);
    let {optionTitle,filterResult} = this.state;
    if(filterResult.length > 0) {
      ipcRenderer.send('transfer-excel',{category:optionTitle,filterResult});
      ipcRenderer.on('reply-transfer-excel',(evt,data) => {
        let {status,message} = data;
        if(status === 'OK') {
          history.push('/');
          ipcRenderer.removeAllListeners('transfer-excel');
          ipcRenderer.removeAllListeners('reply-transfer-excel');
        }else {
          console.log(message);
        }
      });
    }
  }

  render() {
    let {optionTitle,transactionHistory,tableHeader,filterResult} = this.state;
    let filterOptions = this.handleRenderFilter(transactionHistory);
    let dates = this.renderDates(optionTitle);
    console.log('filterOptions in render', filterOptions);
    return (
      <div>
        <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
          <DropdownToggle caret>
            {optionTitle}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Transaction Options</DropdownItem>
            <DropdownItem onClick={this.select}>Order</DropdownItem>
            <DropdownItem onClick={this.select}>Product</DropdownItem>
            <DropdownItem onClick={this.select}>Customer</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        <Filter optionTitle={optionTitle}
                dates={dates}
                onChangeDate={this.handleChangeDate(optionTitle)}
                onFilter={this.handleFilter}
                filter={filterOptions}
                transactionHistory={transactionHistory}/>
        {(transactionHistory.length === 0)? '' :
              <PreviewTable tableHeader={tableHeader} tableBody={filterResult} />}
        <Button className="submit-button" outline size="sm" onClick={this.handleSubmit} color="primary">EXPORT TO EXCEL</Button>
      </div>
    );
  }
}

export default TransactionHistory;
