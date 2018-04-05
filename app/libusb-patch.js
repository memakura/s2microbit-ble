const os = require('os');

if (os.platform() === 'win32') {
  console.log("### libusb(strerror.c) patch is applied");
  var fs = require('fs');
  var f = 'node_modules/usb/libusb/libusb/strerror.c';
  // patch: to avoid C2001 error
  fs.writeFileSync(f, fs.readFileSync(f).toString().replace("Успех", "Успех ").replace("Ресурс занят", "Ресурс занят "));
}
