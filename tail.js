var fs = require('fs');

var fd = null;                // filedescriptor of file
var pos = 0;                        // location in file
const buffer = new Buffer(128);     // intermediate buffer
var loglines = "";      // captured data

var _dir = "";          // directory to listen on
var _file = "";         // file to look for

// start listening on a directory (works also if file does not exist yet)
// if readHead == true, it will try to read all data that is already available in file
exports.startListening = function(dir, file, readHead) {
    readHead = readHead || false;
    _dir = dir;
    _file = file;

    if(readHead) {
        tryOpenFileAndRead(function(err) {
            if(err) console.error(err);         // else data now in loglines
            tail();
        });
    } else {
        tail();
    }
}


exports.getlines = function() {
    var copy = loglines;
    loglines = "";
    return copy;
};

function readLog(cb) {
    // handle log message (only append!!)
    if (fd == null) cb("No open logfile!");
    else {
        fs.read(fd, buffer, 0, 128, pos, function(err, bytesRead, buffer) {
            if (err) cb(err);
            else {
                loglines += buffer.toString('utf8', 0, bytesRead);
                pos += bytesRead;
                if (bytesRead > 0) readLog(cb);
                else cb();
            }
        });
    }
};

function tryOpenFileAndRead(cb)
{
    var completepath = _dir + "/" + _file;
    fs.open(completepath, "r", function(err, filedescriptor) {
        if (!err) {
            fd = filedescriptor;
            readLog(function(err) {
                cb(err);
            });
        } else {
            cb(err);
        }
    })
}

function tail() {

    var tail = fs.watch(_dir);
    tail.on('change', function(event, filename) {
        if (event == "change" && filename == _file) {
            if (fd == null) {
                // first open file
                tryOpenFileAndRead(function(err) {
                     if(err) console.error(err);
                });
            } else {
                readLog(function(err) {
                    if(err) console.error(err);
                });
            }
        };
    });

    tail.on('error', function(err) {
        console.error("Error: " + err);
    });
}
