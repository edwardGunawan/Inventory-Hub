const {app, BrowserWindow} = require('electron');
const glob = require('glob');
const path = require('path');
const url = require('path');
const debug = /--debug/.test(process.argv[2]);
const db = require('./db.js');
const moment = require('moment');


let mainWindow = null;

function initialize() {
  const shouldQuit = makeSingleInstance();
  if(shouldQuit) app.quit();

  loadMainProcess();

  function createWindow(){
    const windowOptions = {
      width:1080,
      height:840,
      minWidth: 1080,
      title:app.getName()
    };

    const startUrl = process.env.DEV_URL || url.format({
      pathname: path.join(__dirname, '/build/index.html'),
      protocol:'file:',
      slashes: true
    });

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(startUrl);

    // mainWindow.webContents.openDevTools();

    if(debug) {
      mainWindow.webContents.openDevTools();
      mainWindow.maximize();
      require('devtron').install();
    }

    // when user clicked on closed on window
    mainWindow.on('closed', () => {
      mainWindow = null; // so it can be garbage collected
    });
  }

  app.on('ready', () => {
    createWindow();

    db.sequelize
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully');
        return db.sequelize.sync({force:true});
      })
      .then(() => {
        console.log('db is already in sync');
        return db.sequelize.transaction(function(t) {
          let timestamps = moment().valueOf();
          return db.customer.findOrCreate({
            where: { name:'Other' }, defaults:{name:'Other'},transaction:t}).then(() => {
            let actions = ['sell','return','new','restock','delete','update'];
            let promises = [];
            actions.forEach((action) => {
              promises.push(db.action.findOrCreate({ where: {action: action},transaction:t}));
            });
            return Promise.all(promises);
          }).catch(e => {
            console.log('something is wrong with transaction', e);
            throw e;
          });
        })
      }).then((res) => {
        console.log(`finished initializing`);
      })
      .catch(e => {
        console.log('Unable to connect/initialized to the database', e);
        throw e;
      });
  });

  /// for Mac
  app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
      app.quit();
    }
  });

  /// for Mac when open the application will launch a browserWindow again
  app.on('activate', () => {
    if(mainWindow === null) {
      createWindow();
    }
  });

}


// Making this a single Instance app
// That means when open a new application, you cannot open another new
// application again. It is only 1 instance
function makeSingleInstance() {
  if(process.mas) return false;

  return app.makeSingleInstance(() => {
    if(mainWindow) {
      if(mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus();
    }
  });
}

// Import all the IPC sender from Main Process
function loadMainProcess() {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
  files.forEach((file) => require(file));
}


// calling the initialize and all that from process.argv command line process
switch(process.argv[1]) {
  default:
    initialize();
}
