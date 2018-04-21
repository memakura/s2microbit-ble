"use strict";

const { ipcRenderer, shell } = require('electron');
const $ = require('jquery');
//const open = require('open');

ipcRenderer.on('mainmsg', function (event, arg) {
    //console.log("[main] " + arg);
    var divLogElem = document.getElementById('console-log');
    divLogElem.innerHTML += arg + "<br>";
    divLogElem.scrollTop = divLogElem.scrollHeight;
});

$('#console-log').on('click', '.select-btn', function () {
    ipcRenderer.send('selected', $(this).val()); // async send
    $('.select-btn').each(function(i, elm) { // disable all buttons
        $(elm).prop('disabled', true);
    });
    $(this).toggleClass('selected'); // change the appearance of the selected one
    /*
    console.log('[renderer] send selected to main');
    ipcRenderer.on('selected-reply', function(event, arg) {
        console.log('[renderer] received selected-reply from main')
    });
    */
});

// rescan button
$('#scan-btn').prop('disabled', true); // initialization

ipcRenderer.on('enablescan', function (event, arg) {
    console.log('enable rescan : currently connected to ' + arg);
    $('#scan-btn').prop('disabled', false);
});

$('#scan-btn').on('click', function () {
    console.log('scan button pressed');
    ipcRenderer.send('startscan', $(this).val());
    $(this).prop('disabled', true);
});


// left button
$('#main-pane').on('click', 'a[href^="http"]', function (event) {
    //console.log('[renderer] a href="http..." clicked')
    event.preventDefault();
});
// middle (wheel) button
$('#main-pane').on('mousedown', 'a[href^="http"]', function (event) {
    //console.log('[renderer] a href="http..." mousedown')
    if(event.which==1 || event.which==2) {
        event.preventDefault();
        shell.openExternal(this.href);
    }
});

