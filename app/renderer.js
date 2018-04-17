"use strict";

const { shell } = require('electron');
const $ = require('jquery');
//const open = require('open');

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
