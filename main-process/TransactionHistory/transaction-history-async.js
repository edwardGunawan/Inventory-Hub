// const {ipcMain} = require('electron');
const db = require('../../db.js');
const moment = require('moment');
const Op = db.Sequelize.Op;

const wb = {SheetNames: [], Sheets:{}};
wb.Props = {
  Title: 'Transaction',
  Author: 'Edward Huang'
}
// find PurchaseOrder (By Month) -> getCustomer, getPurchaseDetail ->
// getProduct -> get('Code'), get('Brand')
async function getTransactionDetailBasedMonth(month='00', year='2018') {
  try {

    let date = moment(`${year}-0${parseInt(month)}`); // get moment data asked
    // because moment subtract also mutate the value, we need to deep clone before doing so
    // and store it in prevMonthDate
    // if it is january, it will ask for january and feb
    let nextMonthDate = date.clone().add(1,'months');
    // console.log(date.toString());
    // console.log(nextMonthDate.toString());

    let purchaseOrders = await db.purchaseOrder.findAll({
      where: {
        timestamps: {
          [Op.lt] : nextMonthDate.valueOf(),
          [Op.gt] : date.valueOf()
        }
      }
    });
    /*
      {
        Date,
        Code,
        Brand,
        Customer,
        Quantity,
        Discount,
        Price,
        totalPricePerItem,
      }
      */
    let data =[];
    for(let order of purchaseOrders) {
      // NOTE: Can't do order.getCustomer because you didn't set the association belongsTo
      // need to set hasMany which put association key to order and belongsTo which put
      // connect that association key back to order in customer get
      // , you can do is setCustomer but not able to getCustomer
      // you are able to getPurchaseOrder when calling customerInstance
      // getting customer name
      let customer = await order.getCustomer();
      let id = order.get('id');

      let purchaseDetails = await db.purchaseDetail.findAll({where:{purchaseOrderId : id}});
      // console.log(`
      //   Time: ${moment.utc(order.get('timestamps')).format('MM/DD/YYYY')}
      //   Customer : ${customer.get('name')}
      //   Order Number ${order.get('id')}
      //
      //   Discount: ${order.get('discount')}
      //   Total: ${order.get('totalPrice')}
      //   Action: ${order.get('action')}
      //   `);
      // can't do forEach cause: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
      for(let detail of purchaseDetails) {
        let productId = detail.get('productId');
        // get db product
        let product = await db.product.findById(productId);
        console.log(product, ' product instance here');
        data.push({
          date: moment.utc(order.get('timestamps')).format('YYYY/MM/DD'),
          customer:customer.get('name'),
          code: product.get('code'),
          brand: product.get('brand'),
          quantity: detail.get('quantity'),
          discount: order.get('discount'),
          price: detail.get('pricePerItem'),
          subTotal: detail.get('totalPricePerItem')
        });
      }
      // order and product has many to many relationship
      // let products = await order.getProducts();
      // products.forEach((product) => {
      //   console.log(`
      //         Product: ${product.get('id')}
      //             Code: ${product.get('code')}
      //             Brand: ${product.get('brand')}
      //         `);
      // });
    }
    // console.log('data',data);
    return data;
  }catch (e) {
    console.log(`Error inside getTransactionDetail ${e}`);
  }
}
// https://github.com/SheetJS/js-xlsx/issues/610
async function writeToSheet(objArr, wb, month,year) {
  try {
    if(typeof require !== 'undefined') XLSX = require('xlsx');
    let ws = XLSX.utils.json_to_sheet(objArr)
    ws_name = `raw data`
    XLSX.utils.book_append_sheet(wb,ws,ws_name);
    XLSX.writeFile(wb,'out.xlsx');
  } catch(e) {
    console.log(e, ' in writeToSheet');
  }

}

getTransactionDetailBasedMonth(5,2018).then((data)=> {console.log(
  `finish executing getTransaction Detail`);
  console.log(data);
  writeToSheet(data,wb);
});
