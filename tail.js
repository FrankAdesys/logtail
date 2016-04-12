var fs = require('fs');

var bridgefd = null;
var pos = 0;
const buffer = new Buffer(128);
var loglines = "";

exports.startListening = function(dir, file) {
    var tail = fs.watch(dir);
    tail.on('change', function(event, filename) {
        if (event == "change" && filename == file) {
            if (bridgefd == null) {
                // first open file
                var completepath = dir + "/" + filename;
                fs.open(completepath, "r", function(err, fd) {
                    if (!err) {
                        bridgefd = fd;
                        readLog();
                    } else {
                        console.error(err);
                    }
                })
            } else {
                readLog();
            }
        };
    });

    tail.on('error', function(err) {
        console.error("Error: " + err);
    });
};

exports.getlines = function() {
    var copy = loglines;
    loglines = "";
    return copy;
};

function readLog() {
    // handle log message (only append!!)
    fs.read(bridgefd, buffer, 0, 128, pos, function(err, bytesRead, buffer) {
        if (err) console.error(err);
        else {
            loglines += buffer.toString('utf8', 0, bytesRead);
            pos += bytesRead;
            if (bytesRead > 0) readLog();
        }
    });
};


