// const {ipcMain, app} = require('electron');
const db = require('../../db.js');
const lib = require('../Helper/lib.js');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
// ipcMain.on('transaction-history-init', async(evt,data) => {
//   try {
//     const dirPath = app.getPath('desktop');
//     let transactionPath = await checkOrCreateDir(path.join(dirPath,'inventoryTransactionHistory'));
//
//     convert = convertExcel({database:db,pathname:transactionPath});
//     const rawData = convert.init();
//     evt.sender.send('reply-transaction-history-init', {status:'OK', message:rawData});
//   } catch(e) {
//     evt.sender.send('reply-transaction-history-init',{status:'Error',message:e});
//     throw e;
//   }
// });
//
//
// ipcMain.on('transaction-history', async (evt, data) => {
//   try {
//     // default to be just search for 1 month
//     const {startMonth=moment().month(),startYear=moment().year(), endMonth=startMonth+1, endYear=startYear} = data;
//     const objArr = await convert.getTransaction(startMonth,startYear,endMonth,endYear);
//     await convert.writeToSheet(['based Date','based Customer','based Product'],objArr,'date','customer','product');
//     evt.sender.send('reply-transaction-history', {status:'OK', message:'Successful Download Excel File'});
//   }catch (e) {
//     evt.sender.send('reply-trasaction-history', {status:'Error', message:e});
//     throw e;
//   }
// });
//
//
// async function checkOrCreateDir(path) {
//   try {
//     fs.statSync(path);
//     return path;
//   }catch (e) {
//     fs.mkdirSync(path);
//     return path;
//   }
// }

let input_arr_customer = [
  {where:{name:'Customer1'},updates:{name: 'Toko Sinarmata'}},
  {where:{name:'Customer2'}, updates:{name:'Toko Pedia'}}
];
let input_arr_product = [
  {where:{code:'Product1'},updates:{brand:'Movado',price:'12'}},
  {where:{code:'Product2'},updates:{brand:'Rolex',price:'1000'}}
];

let destroy_customer = ['Customer1','Customer2'];
let destroy_product=['Product4'];

let libInstance = lib({database:db});
libInstance
.init()
.then((res) => {
  // console.log(res);
  // return libInstance.update(input_arr_customer,'customer');
  return libInstance.update(input_arr_product,'product');
})
.then((res) => {
  // console.log(res);

})
// .initProductHistory().then(({actionProductIndex,productHistory}) => {
//   console.log(actionProductIndex);
//   // console.log(productHistory);
//   Object.keys(productHistory).forEach((timestamps) => {
//     // console.log(timestamps);
//     Object.keys(productHistory[timestamps]).forEach((action) => {
//       console.log(typeof productHistory[timestamps][action]);
//
//     })
//   });
// })
// .initCustomerHistory().then(({actionCustomerIndex,customerHistory}) => {
//   // console.log(actionCustomerIndex);
//   console.log(customerHistory);
// })
// .initPurchaseDetail().then(({orderTimeStamps,purchaseMap,customerPurchaseIndex}) => {
//   console.log(orderTimeStamps);
//   console.log(customerPurchaseIndex);
//   console.log(purchaseMap);
//   orderTimeStamps.forEach((timestamps) => {
//     console.log(moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm:ss'));
//   });
// })
.catch(e => {
  console.log(e);
});
// then(()=> lib.getTransaction(05,2018))
// .then(
//   (objArr) => convert.writeToSheet(['based Date','based Customer','based Product'],objArr,'date','customer','product'))
// .then(() => console.log('finish executing'))
// .catch(e => console.error(e) );
