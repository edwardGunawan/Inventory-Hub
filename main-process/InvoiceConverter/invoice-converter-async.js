// const {ipcMain} = require('electron');
// const pdfInvoice = require('pdf-invoice');
//
// ipcMain.on('convert-pdf', (evt,data) => {
//   let {tableBody,discount,customer,action} = data;
//   //TODO: converting to the invoice item format
//   // convert to the invoice(document, send it to the frontend)
//   // Document render then when people clikc print pdf, run purchase
//   // pipe it to download dir
//   let document = pdfInvoice({
//     company: {
//       phone:'(99)-999-9999',
//       email: 'company@evilcorp.com',
//        address: 'Av. Companhia, 182, Água Branca, Piauí',
//        name: 'Evil Corp.',
//      },
//      customer: {
//        name: 'Elliot Raque',
//        email: 'raque@gmail.com',
//      },
//      items: [
//        {amount: 50.0, name: 'XYZ', description: 'Lorem ipsum dollor sit amet', quantity: 12},
//        {amount: 12.0, name: 'ABC', description: 'Lorem ipsum dollor sit amet', quantity: 12},
//        {amount: 127.72, name: 'DFE', description: 'Lorem ipsum dollor sit amet', quantity: 12},
//      ],
//   });
//   const fs = require('fs')
//
//   docucment.generate() // triggers rendering
//   document.pdfkitDoc.pipe(fs.createWriteStream('path/to/file.pdf'))
//
// });
