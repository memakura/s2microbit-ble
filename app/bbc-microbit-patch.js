const os = require('os');

if (os.platform() === 'win32') {
  console.log("### bbc-microbit patch is applied");
  var fs = require('fs');
  var f = 'node_modules/bbc-microbit/lib/bbc-microbit.js';
  // patch: continue scanning until microbit is found
  fs.writeFileSync(f, fs.readFileSync(f).toString().replace("return (localName !== undefined) && (localName.indexOf('BBC micro:bit') !== -1);",
    "return (localName !== undefined) && (localName !== null) && (localName.indexOf('BBC micro:bit') !== -1);"));
}
