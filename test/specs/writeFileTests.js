(function(module) {

    "use strict";

    var webdavfs = require(__dirname + "/../../source/index.js"),
        wfs = webdavfs("http://localhost:9999/"),
        fs = require("fs"),
        isThere = require("is-there");

    var jsDAV = require("jsDAV/lib/jsdav"),
        jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

    module.exports = {

        setUp: function(done) {
            this.testFileName = __dirname + "/../resources/test.dat";
            this.testSourceFile = __dirname + "/../resources/dir1/bin.dat";
            this.server = jsDAV.createServer({
                node: __dirname + "/../resources/",
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

        writeFile: {

            testWriteText: function(test) {
                var targetFile = this.testFileName;
                wfs.writeFile("/test.dat", "some text", function(err) {
                    if (err) {
                        throw err;
                    }
                    var txt = fs.readFileSync(targetFile, "utf8");
                    test.strictEqual(txt, "some text", "Read content should be accurate");
                    test.done();
                })
            },

            testWriteData: function(test) {
                var buffer = new Buffer(4),
                    targetFile = this.testFileName;
                buffer.writeFloatBE(0xcafebabe, 0);
                wfs.writeFile("/test.dat", buffer, "binary", function(err) {
                    if (err) {
                        throw err;
                    }
                    var newBuffer = new Buffer(4);
                    fs.open(targetFile, 'r', function(openerr, fd) {
                        if (openerr) {
                            throw openerr;
                        }
                        fs.read(fd, newBuffer, 0, 4, 0, function(err, num) {
                            test.ok(buffer.equals(newBuffer), "Read data should match written");
                            fs.closeSync(fd);
                            test.done();
                        });
                    });
                });
            },

            testWriteFile: function(test) {
                var targetFile = this.testFileName,
                    sourceFile = this.testSourceFile;
                fs.readFile(sourceFile, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    wfs.writeFile("/test.dat", data, "binary", function(err) {
                        if (err) {
                            throw err;
                        }
                        fs.readFile(targetFile, function(err, finalData) {
                            if (err) {
                                throw err;
                            }
                            test.ok(finalData.length, "Length is OK");
                            test.ok(finalData.equals(data), "Data is the same");
                            test.done();
                        });
                    });
                });
            }

        }

    };

})(module);
