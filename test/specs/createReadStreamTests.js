"use strict";

var webdavfs = require(__dirname + "/../../source/index.js"),
    wfs = webdavfs("http://localhost:9999/");

var jsDAV = require("jsDAV/lib/jsdav"),
    jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

function streamToBuffer(stream, cb) {
    var bufs = [];
    stream.on("data", function(d) { bufs.push(d); });
    stream.on("end", function() {
        var buf = Buffer.concat(bufs);
        cb(buf);
    });
}

module.exports = {

    setUp: function(done) {
        this.server = jsDAV.createServer({
            node: __dirname + "/../resources/dir1/",
            locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/data")
        }, 9999);
        setTimeout(done, 250);
    },

    tearDown: function(done) {
        this.server.close(function() {
            setTimeout(done, 100);
        });
    },

    createReadStream: {

        getsFullContents: function(test) {
            var stream = wfs.createReadStream("/bin.dat");
            streamToBuffer(stream, function(buff) {
                test.strictEqual(buff.length, 1024, "Stream length should be correct");
                test.done();
            });
        },

        getsPartialContents: function(test) {
            var stream = wfs.createReadStream("/bin.dat", { start: 75, end: 374 });
            streamToBuffer(stream, function(buff) {
                test.strictEqual(buff.length, 300, "Stream length should be correct");
                test.done();
            });
        },

        getsPartialContentsStartOnly: function(test) {
            var stream = wfs.createReadStream("/bin.dat", { start: 768 });
            streamToBuffer(stream, function(buff) {
                test.strictEqual(buff.length, 256, "Stream length should be correct");
                test.done();
            });
        }

    }

};
