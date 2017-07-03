"use strict";

var webdavfs = require(__dirname + "/../../source/index.js"),
    wfs = webdavfs("http://localhost:9999/"),
    fs = require("fs"),
    isThere = require("is-there"),
    waitOn = require("wait-on");

var jsDAV = require("jsDAV/lib/jsdav"),
    jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

function waitOnFile(filename) {
    return new Promise(function(resolve, reject) {
        waitOn(
            {
                resources: [ filename ],
                interval: 50,
                timeout: 1500,
                window: 0
            }, function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            }
        );
    });
}

module.exports = {

    setUp: function(done) {
        this.testFileName = __dirname + "/../resources/dir1/test.dat";
        this.testSourceFile = __dirname + "/../resources/dir1/bin.dat";
        this.server = jsDAV.createServer({
            node: __dirname + "/../resources/dir1/",
            locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/data")
        }, 9999);
        setTimeout(done, 250);
    },

    tearDown: function(done) {
        var targetFile = this.testFileName;
        this.server.close(function() {
            if (isThere(targetFile)) {
                fs.unlinkSync(targetFile);
            }
            setTimeout(done, 100);
        });
    },

    createWriteStream: {

        writesFile: function(test) {
            var targetFile = this.testFileName,
                writeStream = wfs.createWriteStream("/test.dat"),
                readStream = fs.createReadStream(this.testSourceFile);
            readStream.pipe(writeStream);
            readStream.on("end", function() {
                waitOnFile(targetFile).then(function() {
                    fs.readFile(targetFile, function(err, finalData) {
                        if (err) {
                            throw err;
                        }
                        test.strictEqual(finalData.length, 1024, "Length should be correct");
                        test.done();
                    });
                });
            });
            readStream.on("error", function(err) {
                console.error(err);
            });
        }

    }

};
