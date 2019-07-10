//Authour: Dustin Harris
//GitHub: https://github.com/DevL0rd
const remote = require('electron').remote;
const fs = require('fs')
var DB = require('./Devlord_modules/DB.js');
const dialog = remote.dialog;
var window = remote.getCurrentWindow();

var debug = true;
if (debug) {
    $("#dev-btn").show();
    $("#rld-btn").show();
}
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
//IE support string includes
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }
        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}
//IE support array includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        enumerable: false,
        value: function (obj) {
            var newArr = this.filter(function (el) {
                return el == obj;
            });
            return newArr.length > 0;
        }
    });
}
document.getElementById("min-btn").addEventListener("click", function (e) {
    window.minimize();
});
document.getElementById("max-btn").addEventListener("click", function (e) {
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
});

document.getElementById("close-btn").addEventListener("click", function (e) {
    window.close();
});

document.getElementById("dev-btn").addEventListener("click", function (e) {
    window.webContents.openDevTools();
});

document.getElementById("rld-btn").addEventListener("click", function (e) {
    location.reload();
});

document.addEventListener('DOMContentLoaded', function () {
    $("#pageLoadingCover").fadeOut(1000);
});

//PROJECT CODE STARTS HERE

document.getElementById("chooseproject-btn").addEventListener("click", function (e) {
    var path = dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (path) {
        startServer(path[0]);
    }
});
var ipcRenderer = require('electron').ipcRenderer;
var logTimeout
ipcRenderer.on('log', function (event, genHtml) {
    $("#consoleContainer").append(genHtml);
    clearTimeout(logTimeout);
    logTimeout = setTimeout(function () {
        $("#consoleContainer").animate({ scrollTop: $('#consoleContainer').prop("scrollHeight") }, 300);
    }, 300);
});
ipcRenderer.send('registerForHTMLLogging');

function consoleCommand(command) {
    ipcRenderer.send('consoleCommand', command);
}

function startServer(path) {
    ipcRenderer.send('openProject', path);
}

ipcRenderer.send('getIsRunning');
ipcRenderer.on('getIsRunning', function (event, isRunning) {
    if (isRunning) {
        $("#chooseproject").hide();
        $("#serverTools").show(1000);
    }
})
// function stopServer() {
//     ipcRenderer.send('stopServer');
//     $("#chooseproject").show(1000);
//     $("#serverTools").hide();
// }
ipcRenderer.send('getRecents');

ipcRenderer.on('getRecents', function (event, recents) {
    if (recents[0]) {
        $("#recent-1").html(recents[0].name);
        $("#recent-1").click(function () {
            startServer(recents[0].path)
        })
    }
    if (recents[1]) {
        $("#recent-2").html(recents[1].name);
        $("#recent-2").click(function () {
            startServer(recents[1].path)
        })
    }
    if (recents[2]) {
        $("#recent-3").html(recents[2].name);
        $("#recent-3").click(function () {
            startServer(recents[2].path)
        })
    }
});

ipcRenderer.on('openProject', function (event, data) {
    $("#chooseproject").hide();
    $("#serverTools").show(1000);
});

$("#browser-btn").click(function () {
    $(".toolBoxApp").hide();
    $("#browser").fadeIn(1000);
    $('#browser').attr('src', "http://localhost/");
});
$("#stats-btn").click(function () {
    $(".toolBoxApp").hide();
    $("#stats").fadeIn(1000);
});
$("#plugins-btn").click(function () {
    $(".toolBoxApp").hide();
    $("#plugins").fadeIn(1000);
});
$("#settings-btn").click(function () {
    $(".toolBoxApp").hide();
    $("#settings").fadeIn(1000);
});
$('#consoleInput').keypress(function (e) {
    if (e.which == 13) {
        ipcRenderer.send('consoleCommand', $('#consoleInput').val());
        $('#consoleInput').val("");
        return false;    //<---- Add this line
    }
});

function loadPluginPage(id) {
    if (fs.existsSync(pluginList[id].folder + "/settings.html")) {
        fs.readFile(pluginList[id].folder + "/settings.html", 'utf8', function (err, contents) {
            if (!err) {
                $("#pluginSettingsContent").html(contents);
            } else {
                $("#pluginSettingsContent").html(err);
            }
            $("#noSettings").hide();
            $("#pluginSettingsContent").fadeIn(400);
        });
    } else {
        $("#pluginSettingsContent").hide();
        $("#noSettings").fadeIn(400);
    }
}

function togglePlugin(id) {
    var pluginInfo = pluginList[id];
    if (pluginInfo.enabled) {
        pluginInfo.enabled = false;
    } else {
        pluginInfo.enabled = true;
    }
    DB.save(pluginInfo.folder + "/MWSPlugin.json", pluginInfo)
}
var pluginList = [];

ipcRenderer.on('getPlugins', function (event, pluginInfoList) {
    pluginList = pluginInfoList;
    for (i in pluginInfoList) {
        var pluginInfo = pluginInfoList[i];
        var elem = $("#pluginTab0").clone().appendTo("#pluginList");
        $(elem).attr("id", "");
        $(elem).find('.pluginName').text(pluginInfo.name);
        $(elem).attr("onclick", "loadPluginPage('" + i + "');");
        $(elem).find('.pluginToggleCheckbox').prop("checked", pluginInfo.enabled);
        $(elem).find('.pluginToggleCheckbox').attr("onchange", "togglePlugin('" + i + "');");
        $(elem).show(400);
    }
});
ipcRenderer.send('getPlugins');