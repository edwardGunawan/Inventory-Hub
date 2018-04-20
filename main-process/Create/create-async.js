let {ipcMain} = require('electron');
let db = require('../../db.js');
let XLSX = require('xlsx');

/*
  Create new product
*/
// One product, or multiple still using bulkCreate function
// data argument contained product array, [code,amount,price]
ipcMain.on('create', async (event,data) => {
  try {
    let {product_arr} = data;
    let products = await db.product.bulkCreate(product_arr,{returning:true});
    event.sender.send('reply-create', {status:'OK', message:'all products is created'});
  } catch(e) {
    console.log('error in create', e);
    event.sender.send('reply-create', {status:'Error', message:e});
  }
});



// Import from Excel
// data will contain path for excel spreadsheet
ipcMain.on('bulk-import',async (event,data) => {
  try {

    let {path} = data;
    console.log('go through bulk-import', path);
    let excelObj = await importExcel(path);
    console.log(excelObj);
    let products = await db.product.bulkCreate(excelObj,{returning:true}); // returning auto-generate id
    event.sender.send('reply-bulk-import', {status:'OK', message:'Import From Excel Succeed'});
  }catch(e) {
    console.log('go through error',e);
    event.sender.send('reply-bulk-import', {status:'Error', message: e});
  }
});


async function importExcel(path) {
  try {
    let workbook = XLSX.readFile(path);

    let ws = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);

    // get rid of frist 3 because that is the description
    ws.splice(0,3);

    // bulk Import needs to add id by itself, it can't generate ID
    return ws.map((item) => {
      let {__EMPTY_1} = item; // amount
      return {
        code: item['Posisi Stok'],
        amount: Number(__EMPTY_1.replace(/,/g,'')), // get rid of commas for integer value
        price: 100 // current still fixed, excel should write price number
      }
    });
  } catch (e) {
    // console.log('go through error');
    throw new Error(e);
  }

}