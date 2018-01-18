const os = require('os');

if (os.platform() === 'win32') {
  // https://github.com/jasongin/noble-uwp
  console.log("noble is replaced by noble-uwp");
  var fs = require('fs');
  var f = 'node_modules/noble-device/lib/util.js';
  fs.writeFileSync(f, fs.readFileSync(f).toString().replace('require(\'noble\')', 'require(\'noble-uwp\')'));
}
