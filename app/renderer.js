"use strict";

const { ipcRenderer, shell } = require('electron');
const $ = require('jquery');
//const open = require('open');

ipcRenderer.on('mainmsg', function (event, msg) {
    //console.log("[main] " + msg);
    var divLogElem = document.getElementById('console_log');
    divLogElem.innerHTML += msg + "<br>";
    divLogElem.scrollTop = divLogElem.scrollHeight;
});

// left button
$(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
    //open(this.href);
});
// middle (wheel) button
$(document).on('mousedown', 'a[href^="http"]', function (event) {
    if(event.which==2) {
        event.preventDefault();
        shell.openExternal(this.href);
    }
});
