import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {Table, Alert} from 'reactstrap';
import './InvoiceConverter.css';

class InvoiceConverter extends Component {
  constructor(props) {
    super(props);
    let {info} = this.props;
    this.state = {
      items : info.tableBody.map((body) => {
        return {
          code:body.code,
          brand:body.brand,
          price:body.price,
          total:body.total,
          quantity:body.quantity
        } }),
      customer: info.customer,
      discount: info.discount,
      action: info.action,
      total: info.total
    }
    this.handleAlertColor = this.handleAlertColor.bind(this);
  }

  handleAlertColor(action) {
    switch(action) {
      case 'sell':
        return 'primary';
      case 'return':
        return 'danger';
    }
  }

  render() {
    let {items,...other} = this.state;
    console.log(items);
    console.log('other', other);
    return(
      <div>
        <div className="alert-container">
          <Alert color={this.handleAlertColor(other.action)} className="alert-item">
            INVOICE TYPE: {other.action.toUpperCase()}
          </Alert>
          <Alert color="info" className="alert-item">
            CHARGE FOR: {other.customer.toUpperCase()}
          </Alert>
        </div>
        <div className="table-invoice">
          <Table borderless="true">
            <thead>
              <tr>
                <th>Code</th>
                <th>Brand</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item,i) => {
                return (
                  <tr key={i}>
                    <th scope="row">{item.code}</th>
                    <td>{item.brand}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>{item.total}</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      </div>

    )
  }
}

InvoiceConverter.defaultProps = {
  info: PropTypes.object // info pass from parent {tableBody, customer,}
}

export default InvoiceConverter;
