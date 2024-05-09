"use strict";

// Module to control application life.
// Module to communicate with renderer process
// Module to create native browser window.
const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const BBCMicrobit = require('bbc-microbit');
let device = null;
let microbitConnected = false;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 820, 
    height: 740
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  mainWindow.webContents.on('did-finish-load', function() {
    // Find microbits
    if (device === null) {
      microbitScanner();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// https://github.com/sandeepmistry/node-bbc-microbit/blob/master/API.md

const BUTTON_VALUE_MAPPER = ['Not Pressed', 'Pressed', 'Long Press'];

let debug = false;

// functionality
let useButtons = true;
let useTemperature = true;
let useAccelerometer = true;
let useMagnetometer = true; // switch to false if not stable
let usePins = true;

// states and values
let buttonState = null;
let matrixState = null;
let pinValue = null;
let pinMode = null;
let temperature = null;
let magnetometerBearing = null;
let magnetometer = null;
let accelerometer = null;
let prev_acc_z = null;
let ledBuffer = null;
let deviceName = null;

const PIN_NOTSET = 0xFF;
const PINMODE_OUTPUT_DIGITAL = 0x00;
const PINMODE_INPUT = 0x01;
const PINMODE_ANALOG = 0x02;
const PINMODE_ANALOG_INPUT = 0x03;

// LED matrix patterns (new Buffer has been deprecated: https://nodejs.org/api/buffer.html#buffer_buffer)
const LED_PATTERNS = [
  {name: 'HAPPY', value: Buffer.from([0b00000, 0b01010, 0b00000, 0b10001, 0b01110])},
  {name: 'SAD',   value: Buffer.from([0b00000, 0b01010, 0b00000, 0b01110, 0b10001])},
  {name: 'ANGRY', value: Buffer.from([0b10001, 0b01010, 0b00000, 0b11111, 0b10101])},
  {name: 'SMILE', value: Buffer.from([0b00000, 0b00000, 0b00000, 0b10001, 0b01110])},
  {name: 'HEART', value: Buffer.from([0b01010, 0b11111, 0b11111, 0b01110, 0b00100])},
  {name: 'CONFUSED', value: Buffer.from([0b00000, 0b01010, 0b00000, 0b01010, 0b10101])},
  {name: 'ASLEEP', value: Buffer.from([0b00000, 0b11011, 0b00000, 0b01110, 0b00000])},
  {name: 'SURPRISED', value: Buffer.from([0b01010, 0b00000, 0b00100, 0b01010, 0b00100])},
  {name: 'SILLY', value: Buffer.from([0b10001, 0b00000, 0b11111, 0b00011, 0b00011])},
  {name: 'FABULOUS', value: Buffer.from([0b11111, 0b11011, 0b00000, 0b01010, 0b01110])},
  {name: 'MEH', value: Buffer.from([0b01010, 0b00000, 0b00010, 0b00100, 0b01000])},
  {name: 'YES', value: Buffer.from([0b00000, 0b00001, 0b00010, 0b10100, 0b01000])},
  {name: 'NO', value: Buffer.from([0b10001, 0b01010, 0b00100, 0b01010, 0b10001])},
  {name: 'TRIANGLE', value: Buffer.from([0b00000, 0b00100, 0b01010, 0b11111, 0b00000])},
  {name: 'DIAMOND', value: Buffer.from([0b00100, 0b01010, 0b10001, 0b01010, 0b00100])},
  {name: 'DIAMOND_SMALL', value: Buffer.from([0b00000, 0b00100, 0b01010, 0b00100, 0b00000])},
  {name: 'SQUARE', value: Buffer.from([0b11111, 0b10001, 0b10001, 0b10001, 0b11111])},
  {name: 'SQUARE_SMALL', value: Buffer.from([0b00000, 0b01110, 0b01010, 0b01110, 0b00000])},
  {name: 'TARGET', value: Buffer.from([0b00100, 0b01110, 0b11011, 0b01110, 0b00100])},
  {name: 'STICKFIGURE', value: Buffer.from([0b00100, 0b11111, 0b00100, 0b01010, 0b10001])},
  {name: 'RABBIT', value: Buffer.from([0b10100, 0b10100, 0b11110, 0b11010, 0b11110])},
  {name: 'COW', value: Buffer.from([0b10001, 0b10001, 0b11111, 0b01110, 0b00100])},
  {name: 'ROLLERSKATE', value: Buffer.from([0b00011, 0b00011, 0b11111, 0b11111, 0b01010])},
  {name: 'HOUSE', value: Buffer.from([0b00100, 0b01110, 0b11111, 0b01110, 0b01010])},
  {name: 'SNAKE', value: Buffer.from([0b11000, 0b11011, 0b01010, 0b01110, 0b00000])},
  {name: 'ARROW_N', value: Buffer.from([0b00100, 0b01110, 0b10101, 0b00100, 0b00100])},
  {name: 'ARROW_NE', value: Buffer.from([0b00111, 0b00011, 0b00101, 0b01000, 0b10000])},
  {name: 'ARROW_E', value: Buffer.from([0b00100, 0b00010, 0b11111, 0b00010, 0b00100])},
  {name: 'ARROW_SE', value: Buffer.from([0b10000, 0b01000, 0b00101, 0b00011, 0b00111])},
  {name: 'ARROW_S', value: Buffer.from([0b00100, 0b00100, 0b10101, 0b01110, 0b00100])},
  {name: 'ARROW_SW', value: Buffer.from([0b00001, 0b00010, 0b10100, 0b11000, 0b11100])},
  {name: 'ARROW_W', value: Buffer.from([0b00100, 0b01000, 0b11111, 0b01000, 0b00100])},
  {name: 'ARROW_NW', value: Buffer.from([0b11100, 0b11000, 0b10100, 0b00010, 0b00001])},
  {name: 'HEART_SMALL', value: Buffer.from([0b000000, 0b01010, 0b01110, 0b00100, 0b00000])},
  {name: 'TRIANGLE_LEFT', value: Buffer.from([0b10000, 0b11000, 0b10100, 0b10010, 0b11111])},
  {name: 'CHESSBOARD', value: Buffer.from([0b01010, 0b10101, 0b01010, 0b10101, 0b01010])},
  {name: 'PITCHFORK', value: Buffer.from([0b10101, 0b10101, 0b11111, 0b00100, 0b00100])},
  {name: 'XMAS', value: Buffer.from([0b00100, 0b01110, 0b00100, 0b01110, 0b11111])},
  {name: 'TSHIRT', value: Buffer.from([0b11011, 0b11111, 0b01110, 0b01110, 0b01110])},
  {name: 'SWORD', value: Buffer.from([0b00100, 0b00100, 0b00100, 0b01110, 0b00100])},
  {name: 'UMBRELLA', value: Buffer.from([0b01110, 0b11111, 0b00100, 0b10100, 0b01100])},
  {name: 'DUCK', value: Buffer.from([0b01100, 0b11100, 0b01111, 0b01110, 0b00000])},
  {name: 'TORTOISE', value: Buffer.from([0b00000, 0b01110, 0b11111, 0b01010, 0b00000])},
  {name: 'BUTTERFLY', value: Buffer.from([0b11011, 0b11111, 0b00100, 0b11111, 0b11011])},
  {name: 'GIRAFFE', value: Buffer.from([0b11000, 0b01000, 0b01000, 0b01110, 0b01010])},
  {name: 'SKULL', value: Buffer.from([0b01110, 0b10101, 0b11111, 0b01110, 0b01110])},
  {name: 'MUSIC_CROTCHET', value: Buffer.from([0b00100, 0b00100, 0b00100, 0b11100, 0b11100])},
  {name: 'MUSIC_QUAVER', value: Buffer.from([0b00100, 0b00110, 0b00101, 0b11100, 0b11100])},
  {name: 'MUSIC_QUAVERS', value: Buffer.from([0b01111, 0b01001, 0b01001, 0b11011, 0b11011])},
  {name: 'SCISSORS', value: Buffer.from([0b11001, 0b11010, 0b00100, 0b11010, 0b11001])},
  {name: 'PACMAN', value: Buffer.from([0b01111, 0b11010, 0b11100, 0b11000, 0b01111])},
  {name: 'GHOST', value: Buffer.from([0b01110, 0b10101, 0b11111, 0b11111, 0b10101])}
];
let LED_PATTERN_MAP = { }; // map : pattern name -> value
function createLedPatternMap() {
  for (var i=0; i < LED_PATTERNS.length; i++){
    LED_PATTERN_MAP[LED_PATTERNS[i].name] = LED_PATTERNS[i].value; // value=reference
  }
}
createLedPatternMap();

// Initialization
function initValues () {
  console.log('Initialize values...');
  buttonState = {A: 0, B: 0};
  matrixState = [0, 0, 0, 0, 0];
  // The array has space for P0 to P20 (including P17 and P18).
  pinValue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // 00(0):D-Out, 01(1):D-In, 10(2):A-Out, 11(3):A-In
  pinMode = [PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, 
      PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, 
      PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, 
      PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET, PIN_NOTSET];

  // Initialize LED matrix
  ledBuffer = Buffer.alloc(5);
  LED_PATTERN_MAP['YES'].copy(ledBuffer); // copy the value (do not pass by reference)

  // Initialize sensor data
  temperature = 0;
  magnetometerBearing = 0;
  magnetometer = { 'x': 0, 'y': 0, 'z': 0 };
  accelerometer = { 'x': 0, 'y': 0, 'z': 0 };
  prev_acc_z = 0;

}

initValues();

console.log('=== BBC micro:bit Scratch 2.0 offline extension ===');
// createWindow (mainWindow.webContents.on('did-finish-load') ) 
//   -> microbitScanner -> microbitFound -> connectAndSetup -> startHTTPServer


// Output log to both terminal and renderer's console (in the developer tool)
function logBothConsole (msg, newline = true) {
  console.log(msg);
  if (newline) {
    mainWindow.webContents.send('mainmsg', msg + "<br>");
  } else {
    mainWindow.webContents.send('mainmsg', msg);
  }
}

// ------------- discover microbit (begin) ----------------
//var id = 'dd628ee75dfe';
//var id = 'd5a250cd6035';

let scanning_all = false; // check if discverAll is active
let microbit_list = []; // the list of found microbit
let timeoutfunc_id = null; // setTimeout timer id
let intervalfunc_id = null; // setInterval timer id
let scan_round = 0; // to ignore old select-btn

// Discover microbit
function microbitScanner() {
  logBothConsole('microbit: scanning...');
  if (!scanning_all) {
    scan_round++;
    microbit_list = [];
    BBCMicrobit.discoverAll( onDiscover ); // keep scanning until stop is called
    scanning_all = true;
  }
  //BBCMicrobit.discoverById(id, microbitFound);
  //BBCMicrobit.discover(microbitFound);
}

// Called each time a new microbit is discovered
function onDiscover(microbit) {
  logBothConsole('<br>  found microbit : <button class="select-btn" type="button" value="'
   + scan_round + '-' + microbit_list.length + '">' + microbit.address + '</button>');
  microbit_list.push(microbit); // the above line needs to come before this line (0-index)
  if (microbit_list.length == 1) { // if this is the first microbit
    // set timer to wait for other microbits
    timeoutfunc_id = setTimeout(checkFoundNum, 7000);
    var cnt_sec = 0; // counting seconds
    intervalfunc_id = setInterval( function() {
      cnt_sec += 1;
      logBothConsole('.', false); // visualize the progress while scanning
      if(cnt_sec == 6) {
        clearInterval(intervalfunc_id);
      }
    }, 1000);
  }
}

// Called (with delay) after the first microbit is found (For auto connection)
function checkFoundNum() {
  if (scanning_all && microbit_list.length == 1) { // if there is only  one microbit
    logBothConsole('  auto connection...')
    microbitFound(microbit_list[0]); // connect to the microbit
  } else if (microbit_list.length >= 2) { // if more microbits are found
    logBothConsole(' ひとつクリックしてください / Select and click one.');
  }
}

// Called when a select-btn is clicked
ipcMain.on('selected', function (event, arg) {
  var ss = arg.split('-');
  if (ss[0]==scan_round) { // check if the button is from the latest scan-round
    logBothConsole('  selected: ' + ss[1]);
    if (timeoutfunc_id !== null) {
      clearTimeout(timeoutfunc_id); // stop auto connection
      timeoutfunc_id = null;
    } 
    if (intervalfunc_id !== null) {
      clearInterval(intervalfunc_id); // stop progress display
      intervalfunc_id = null;
    }
    //event.sender.send('selected-reply', 'ok'); // reply to asynchronous send from renderer
    microbitFound(microbit_list[ss[1]]);
  }
});

// Scan button is pressed
ipcMain.on('startscan', function (event, arg) {
  //logBothConsole('microbit: scan button pressed!');
  if (device !== null && microbitConnected) {
    logBothConsole('  disconnect before scanning');
    device.disconnect( function() {  // 'disconnect' event is also emitted
    });
  } else {
    microbitScanner();
  }
});

// Start connection (called when discovered)
function microbitFound(microbit) {
  logBothConsole('microbit: connecting to microbit: ' + microbit.address); // microbit.id, microbit.address
  if (scanning_all) { // if still scanning
     logBothConsole('  stop scanning all...');
     BBCMicrobit.stopDiscoverAll( onDiscover );
     scanning_all = false;
  }

  // Events from the connected microbit device or s2microbit (scan button)
  microbit.on('disconnect', function() {
    microbitConnected = false;
    device = null;
    logBothConsole('microbit: disconnected. microbitConnected= ' + microbitConnected);
    initValues();
    microbitScanner();
  });

  microbit.on('buttonAChange', function(value) {
    if (debug) { logBothConsole('microbit: button A', BUTTON_VALUE_MAPPER[value]); }
    buttonState['A']= value;
  });

  microbit.on('buttonBChange', function(value) {
    if (debug) { logBothConsole('microbit: button B', BUTTON_VALUE_MAPPER[value]); }
    buttonState['B']= value;
  });

  microbit.on('pinDataChange', function(pin, value) {
    if (debug) { logBothConsole('microbit: Input pin ' + pin + ', value ' + value); }
    pinValue[pin] = value;
  });

  microbit.on('temperatureChange', function(value) {
    if (debug) { logBothConsole('microbit: temperature ' + value); }
    temperature = value;
  });

  microbit.on('magnetometerBearingChange', function(value) {
    //logBothConsole('microbit: magnetometer bearing ' + value);
    if (debug) { logBothConsole('microbit: magnetometer bearing ' + value); }
    magnetometerBearing = value;
  });

  microbit.on('magnetometerChange', function(x, y, z) {
    //logBothConsole('microbit: orig magnetometer ' + x + ', ' + y + ', ' + z);
    x = x.toFixed(2);
    y = y.toFixed(2);
    z = z.toFixed(2);
    if (debug) { logBothConsole('microbit: magnetometer ' + x + ', ' + y + ', ' + z); }
    magnetometer = { 'x': x, 'y': y, 'z': z };
  });

  microbit.on('accelerometerChange', function(x, y, z) {
    //logBothConsole('microbit: orig accelerometer ' + x + ', ' + y + ', ' + z);
    x = x.toFixed(2);
    y = y.toFixed(2);
    z = z.toFixed(2);
    if (debug) { logBothConsole('microbit: accelerometer ' + x + ', ' + y + ', ' + z); }
    accelerometer = { 'x': x, 'y': y, 'z': z };
  });

  // settings after connection
  logBothConsole('microbit: (This may take a while) connecting.....');
  // Connect
  microbit.connectAndSetUp(function() {
    microbitConnected = true;
    device = microbit;
    logBothConsole('microbit: connected ' + microbitConnected);
    mainWindow.webContents.send('enablescan', microbit.address); // enable rescan

    if (useButtons) {
      microbit.subscribeButtons(function(error) {
        logBothConsole('microbit: subscribed to buttons');
      });
    }
    if (useTemperature) {
      microbit.writeTemperaturePeriod(1000, function() {
        microbit.subscribeTemperature(function(error) {
          logBothConsole('microbit: subscribed to temperature');
        });
      });
    }
    if (useMagnetometer) {
      microbit.writeMagnetometerPeriod(160, function() {
        microbit.subscribeMagnetometerBearing(function(error) {
          logBothConsole('microbit: subscribed to magnetometer bearing');
        });
        microbit.subscribeMagnetometer(function(error) {
          logBothConsole('microbit: subscribed to magnetometer');
        });
      });
    }
    if (useAccelerometer) {
      microbit.writeAccelerometerPeriod(160, function() {
        microbit.subscribeAccelerometer(function(error) {
          logBothConsole('microbit: subscribed to accelerometer');
        });
      });
    }
    if (usePins) {
//      microbit.subscribePinData(function(error) {
//        logBothConsole('microbit: subscribePinData');
        initializePinSetting(microbit); // Initialize pin mode
//      });
    }
    // Read device name
    microbit.readDeviceName(function(error, devicename) {
      logBothConsole('microbit deviceName: ' + devicename);
      deviceName = devicename;
    });

    // Initial pattern
    writeLedBuffer();
    
    if (exserver === null) {
      startHTTPServer();
    }
  });
}
// ------------- discover microbit (end) ----------------


// ------------- pin settings (begin) ----------------
// Show pin settings
function showPinSetting(microbit) {
  microbit.readPinAdConfiguration(function(error, value) {
    logBothConsole('pinsetting AD: ' + value);
  });
  microbit.readPinIoConfiguration(function(error, value) {
    logBothConsole('pinsetting IO: ' + value);
  });  
}

// Initialize pin setting to Analog-Input (0-2) and Digital-Input (8, 13-16)
function initializePinSetting(microbit) {
  for (var pin of [0, 1, 2]) {
    setupPinMode({pin: pin, ADmode: 'analog', IOmode: 'input'});
  }
 for (var pin of [8, 13, 14, 15, 16]) {
   setupPinMode({pin: pin, ADmode: 'digital', IOmode: 'input'});
 }
}

// Setting up pin mode (analog/digital and input/output)
function setupPinMode(data) {
  return new Promise(function(resolve, reject){
    if (device === null) {
      reject(new Error('no device'));
    } else {
      if (debug) { logBothConsole('setupPinMode: pin ' + data.pin + ' is originally configured as: ' + pinMode[data.pin]); }
      function log(data) {
        logBothConsole('microbit: setup pin ' + data.pin + ' as ' + data.ADmode + ' ' + data.IOmode);
      }
      // SubscribeData
      function subscribe(device, data) {
        device.subscribePinData(function(error){
          logBothConsole('microbit: subscribePinData');
          device.readPin(data.pin, function(error, value) { // trigger a pinDataChange
            if (debug) { showPinSetting(device); }
            log(data);
            resolve(data);
          });
        });
      }
      // UnsubscribeData
      function unsubscribe(device) {
        device.unsubscribePinData(function(error){
          if (debug) { showPinSetting(device); }
          log(data);
          resolve(data);  
        });
      }

      pinMode[data.pin] = PINMODE_OUTPUT_DIGITAL;
      if (data.IOmode == 'input') {
        pinMode[data.pin] += PINMODE_INPUT;
        device.pinInput(data.pin, function(error) {
          if (data.ADmode == 'analog') {
            pinMode[data.pin] += PINMODE_ANALOG;
            device.pinAnalog(data.pin, function(error) {
              subscribe(device, data);
            });
          } else {
            device.pinDigital(data.pin, function(error) {
              subscribe(device, data);
            });
          };
        });
      } else {
        device.pinOutput(data.pin, function(error) {
          if (data.ADmode == 'analog') {
            pinMode[data.pin] += PINMODE_ANALOG;
            device.pinAnalog(data.pin, function(error) {
              unsubscribe(device);
            });
          } else {
            device.pinDigital(data.pin, function(error) {
              unsubscribe(device);
            });
          }
        });
      }
    }
  });
}
// ------------- pin settings (end) ----------------



// ================= HTTP server and routing =======================
const express = require('express');
let exapp = express();
let exserver = null;
let waiting_commands = new Set();  // for Scratch wait blocks


function startHTTPServer(){
  exserver = exapp.listen(50209, function(){
    logBothConsole('Server started... listening port ' + exserver.address().port);
  });
}

// Responses to HTTP requrests from Scratch 2.0
//--- Reset from scratch
exapp.get('/reset_all', function(req, res){
  logBothConsole('microbit: reset_all is called');
  waiting_commands.clear();
  initValues();
  initializePinSetting(device);  // Initialize pin mode
  res.send('OK');
});

//===== LED matrix =====
//--- Scrole text
// nowait block
exapp.get('/scroll/:text', function(req, res) {
  res.send(scroll_text(false, req.params.text));
});
// wait block
exapp.get('/scroll/:command_id/:text', function(req, res) {
  res.send(scroll_text(req.params.command_id, req.params.text));
});
function scroll_text(command_id, text) {
  if (device !== null) {
    if (command_id) waiting_commands.add(command_id);  // wait block
    // text is a string that must be 20 characters or less
    device.writeLedText(text.substring(0, 20), function(error) {
      logBothConsole('microbit: display ' + text);
      if (command_id) waiting_commands.delete(command_id);
    });
  }
  return('OK');
}

// Write image pattern to the LED matrix
function writeLedBuffer(error) {
  return new Promise(function(resolve) {
    device.writeLedMatrixState(ledBuffer, function(error) {
      if (debug) { logBothConsole('microbit: writeLedBuffer: buf= ' + ledBuffer.toString('hex')); }
      resolve();
    });
  });
}

//--- LED display preset image
// nowait block
exapp.get('/display_image/:name', function(req, res) {
  if (debug) logBothConsole('no command');
  res.send(display_image(false, req.params.name));
});
// wait block
exapp.get('/display_image/:command_id/:name', function(req, res) {
  if (debug) logBothConsole('command_id: ' + req.params.command_id);
  res.send(display_image(req.params.command_id, req.params.name));
});
function display_image(command_id, name) {
  if (device !== null) {
    if (command_id) waiting_commands.add(command_id);  // wait block
    if (name.charAt(2) == '_') { // non-English
      LED_PATTERNS[name.substr(0,2)-1].value.copy(ledBuffer);
    } else { // English
      LED_PATTERN_MAP[name].copy(ledBuffer);
    }
    logBothConsole('microbit: [display_image] name= ' + name);
    writeLedBuffer().then(function() {
      if(command_id) waiting_commands.delete(command_id);
    });
  }
  return('OK');
}

//--- LED dot
// nowait block
exapp.get('/write_pixel/:x/:y/:value', function(req, res){
  if (debug) logBothConsole('no command');
  res.send(write_pixel(false, req.params.x, req.params.y, req.params.value));
});
// wait block
exapp.get('/write_pixel/:command_id/:x/:y/:value', function(req, res){
  if (debug) logBothConsole('command_id: ' + req.params.command_id);
  res.send(write_pixel(req.params.command_id, req.params.x, req.params.y, req.params.value));
});
function write_pixel(command_id, x, y, val) {
  if (device !== null) {
    if (command_id) waiting_commands.add(command_id);  // wait block
    if (val >= 1) {
      val = 1;
    }else{
      val = 0;
    }
    if (x < 0){
      x = 0;
    }
    if (x > 4){
      x = 4;
    }
    if (y < 0){
      y = 0;
    }
    if (y > 4){
      y = 4;
    }
    ledBuffer[y] &= ~(0x01<<(4-x)); // clear the pixel (set 0)
    ledBuffer[y] |=  val<<(4-x); // set the pixel to 'val'
    logBothConsole('microbit: [write_pixel] val=' + val + ' to ('+ x + ', ' + y + ')');
    writeLedBuffer().then(function() {
      if(command_id) waiting_commands.delete(command_id);
    });
  }
  return('OK');
}

//--- LED display custom pattern
// nowait block
exapp.get('/display_pattern/:binstr', function(req, res) {
  if (debug) logBothConsole('no command');
  res.send(display_pattern(false, req.params.binstr));
});
// wait block
exapp.get('/display_pattern/:command_id/:binstr', function(req, res) {
  if (debug) logBothConsole('command_id: ' + req.params.command_id);
  res.send(display_pattern(req.params.command_id, req.params.binstr));
});
function display_pattern(command_id, binstr) {
  if (device !== null) {
    if (command_id) waiting_commands.add(command_id);
    try {
      logBothConsole('[display_pattern] ' + binstr);
      // check
      if ( ! /^[01]{5} [01]{5} [01]{5} [01]{5} [01]{5}$/.test(binstr) ) {
        logBothConsole('error: illegal pattern');
        throw new Error('illegal pattern');
      }
      var linearray = binstr.split(' ');
      /*
      if (linearray.length != 5) {
        logBothConsole('microbit: [display_pattern] error: illegal array length= ' + linearray.length);
        res.send('ERROR');
        return;
      }
      */
      for (var y=0; y < 5; y++) {
        ledBuffer.writeUInt8(parseInt(linearray[y], 2), y);
        //logBothConsole('microbit: buf[' + y + '] = ' + ledBuffer[y]);
      }
      writeLedBuffer().then(function() {
        if (command_id) waiting_commands.delete(command_id);
      }).catch(function(error) {
        logBothConsole(error);
        throw(error);
      });
    } catch (e) {
      logBothConsole(e);
      if (command_id) waiting_commands.delete(command_id);
    }
  }
  return('OK');
}

//--- clear LED
// nowait block
exapp.get('/display_clear', function(req, res){
  if (debug) logBothConsole('no command');
  res.send(display_clear(false));
});
// wait block
exapp.get('/display_clear/:command_id', function(req, res){
  if (debug) logBothConsole('command_id: ' + req.params.command_id);
  res.send(display_clear(req.params.command_id));
});
function display_clear(command_id) {
  if (device !== null) {
    if (command_id) waiting_commands.add(command_id);
    ledBuffer.fill(0);
    logBothConsole('microbit: [display_clear]');
    writeLedBuffer().then(function() {
      if (command_id) waiting_commands.delete(command_id);
    }).catch(function(error) {
      logBothConsole(error);
      throw(error);
      if (command_id) waiting_commands.delete(command_id);
    });
  }
  return('OK');
}

//===== PIN I/O =====
//--- Setup pin mode
// nowait block
exapp.get('/setup_pin/:pin/:admode/:iomode', function(req, res) {
  if (debug) logBothConsole('no command_id');
  res.send(setup_pin(false, req.params.pin, req.params.admode, req.params.iomode));
});
// wait block
exapp.get('/setup_pin/:command_id/:pin/:admode/:iomode', function(req, res) {
  if (debug) logBothConsole('command_id: ' + req.params.command_id);
  res.send(setup_pin(req.params.command_id, req.params.pin, req.params.admode, req.params.iomode));
});
function setup_pin(command_id, pin, admode, iomode) {
  if (device !== null) {
    if (command_id) waiting_commands.add(command_id);  // wait block
    try {
      if(pin < 0 || pin > 20 ){
        logBothConsole('microbit: [setup_pin] error: pin number (' + pin + ') is out of range');
        throw new Error('illegal pin number');
      }

      if (admode.charAt(0) == 'D') {
        admode = 'digital';
      } else if (admode.charAt(0) == 'A') {
        admode = 'analog';
      } else {
        logBothConsole('microbit: [setup_pin] error: no such ADmode: ' + admode);
        throw new Error('illegal ADmode');
      }
      if (iomode.charAt(0) == 'I') {
        iomode = 'input';
      } else if (iomode.charAt(0) == 'O') {
        iomode = 'output';
      } else {
        logBothConsole('[setup_pin] error: no such IOmode: ' + iomode);
        throw new Error('illegal IOmode');
      }

      setupPinMode({pin: pin, ADmode: admode, IOmode: iomode}).then(function() {
        if(command_id) waiting_commands.delete(command_id);  // should be called after setupPinMode        
      }).catch(function(error) {
        logBothConsole(error);
        throw(error);
      });
    } catch(e) {
      logBothConsole(e);
      if(command_id) waiting_commands.delete(command_id);
    }
  }
  return('OK');
}

//--- Digital write
// nowait block
exapp.get('/digital_write/:pin/:value', function(req, res) {
  if (debug) logBothConsole('no command_id');
  res.send(digital_write(false, req.params.pin, req.params.value));
});
// wait block
exapp.get('/digital_write/:command_id/:pin/:value', function(req, res) {
  if (debug) logBothConsole('command_id: ' + req.params.command_id);
  res.send(digital_write(req.params.command_id, req.params.pin, req.params.value));
});
function digital_write(command_id, pin, value) {
  if (device !== null) {
    if (command_id) waiting_commands.add(command_id);  // wait block
    function _digital_write() {
      device.writePin(pin, value, function(error) {
        logBothConsole('microbit: [digital_write] pin ' + pin + ', value ' + value);
        if (command_id) waiting_commands.delete(command_id);
      });
    }
    try {
      if(pin < 0 || pin > 20 ){
        logBothConsole('microbit: [digital_write] error: pin number (' + pin + ') is out of range');
        throw new Error('illegal pin number');
      }
      if (value >= 1) {
        value = 1;
      } else {
        value = 0;
      }
      if( (pinMode[pin] & PINMODE_INPUT) == PINMODE_INPUT || (pinMode[pin] & PINMODE_ANALOG) == PINMODE_ANALOG ) {
        logBothConsole('microbit: [digital_write] setup pin mode : current pinMode[' + pin + ']= ' + pinMode[pin]);
        setupPinMode({pin: pin, ADmode: 'digital', IOmode: 'output'})
        .then(function() {
          _digital_write();
        }).catch(function(error) {
          logBothConsole(error);
          throw(error);
        });
      } else { // pin mode is already set as Digital Output
        _digital_write();
      }
    } catch (e) {
      logBothConsole(e);
      if(command_id) waiting_commands.delete(command_id);
    }
  }
  return('OK');
}

//--- Analog write
exapp.get('/analog_write/:pin/:value', function(req, res) {
  if (debug) logBothConsole('no command_id');
  res.send(analog_write(false, req.params.pin, req.params.value));
});
exapp.get('/analog_write/:command_id/:pin/:value', function(req, res) {
  if (debug) logBothConsole('command_id: ' + req.params.command_id);
  res.send(analog_write(req.params.command_id, req.params.pin, req.params.value));
});
function analog_write(command_id, pin, value) {
  if (device !== null) {
    if (command_id) waiting_commands.add(command_id);  // wait block
    function _analog_write() {
      device.writePin(pin, value, function(error) {
        logBothConsole('microbit: [analog_write] pin ' + pin + ', value ' + value);
        if (command_id) waiting_commands.delete(command_id);
      });
    }
    try {
      if(pin < 0 || pin > 20 ){
        logBothConsole('microbit: [analog_write] error: pin number (' + pin + ') is out of range');
        throw new Error('illegal pin number');        
      }
      if(value > 255) {
        value = 255;
      }
      if(value < 0) {
        value = 0;
      }
      if( (pinMode[pin] & PINMODE_INPUT) == PINMODE_INPUT || (pinMode[pin] & PINMODE_ANALOG) != PINMODE_ANALOG ) {
        logBothConsole('microbit: [analog_write] setup pin mode : current pinMode[' + pin + ']= ' + pinMode[pin]);
        setupPinMode({pin: pin, ADmode: 'analog', IOmode:' output'})
        .then (function() {
          _analog_write();
        }).catch(function(error) {
          logBothConsole(error);
          throw(error);
        });
      } else {
        _analog_write();
      }
    } catch(e) {
      logBothConsole(e);
    }
  }
  return('OK');
}

// Response to polling
exapp.get('/poll', function(req, res) {
  var reply = '';
  reply += 'button_a_pressed ' + (buttonState['A']!=0) + '\n';
  reply += 'button_b_pressed ' + (buttonState['B']!=0) + '\n';
  for (var pin=0; pin <= 20; pin++){
    if ((pinMode[pin] != PIN_NOTSET) && (pinMode[pin] & PINMODE_INPUT)){
      if (pinMode[pin] & PINMODE_ANALOG){
        reply += 'analog_read/' + pin + ' ' + pinValue[pin] + '\n';
      }else{
        reply += 'digital_read/' + pin + ' ' + pinValue[pin] + '\n';
      }
    }
  }
  if (accelerometer['x'] > 0) {
    reply += 'tilted_right true\ntilted_left false\n';
  } else {
    reply += 'tilted_right false\ntilted_left true\n';
  }
  if (accelerometer['y'] > 0) {
    reply += 'tilted_up true\ntilted_down false\n';
  } else {
    reply += 'tilted_up false\ntilted_down true\n';
  }
  if ( Math.abs(accelerometer['z'] - prev_acc_z) > 0.7 ) {
    reply += 'shaken true\n';
  } else {
    reply += 'shaken false\n';
  }
  prev_acc_z = accelerometer['z'];

  // sensor values
  reply += 'temperature ' + temperature + '\n';
  reply += 'magBearing ' + magnetometerBearing + '\n';
  reply += 'mag_x ' + magnetometer['x'] + '\n';
  reply += 'mag_y ' + magnetometer['y'] + '\n';
  reply += 'mag_z ' + magnetometer['z'] + '\n';
  reply += 'acc_x ' + accelerometer['x'] + '\n';
  reply += 'acc_y ' + accelerometer['y'] + '\n';
  reply += 'acc_z ' + accelerometer['z'] + '\n';
  reply += '_busy ' + Array.from(waiting_commands).join(' ');
  
  res.send(reply);
  if (debug) { logBothConsole(reply); }
});
// =============================================================


