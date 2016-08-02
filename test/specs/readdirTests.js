(function(module) {

    "use strict";

    var webdavfs = require(__dirname + "/../../source/index.js"),
        wfs = webdavfs("http://localhost:9999/"),
        fs = require("fs");

    var jsDAV = require("jsDAV/lib/jsdav"),
        jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

    module.exports = {

        setUp: function(done) {
            this.server = jsDAV.createServer({
                node: __dirname + "/../resources/dir1/",
                locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/data")
            }, 9999);
            this.testDir = __dirname + "/../resources/dir1/testdir";
            try {
                fs.mkdirSync(this.testDir);
            } catch (err) {}
            setTimeout(done, 250);
        },

        tearDown: function(done) {
            fs.rmdirSync(this.testDir);
            this.server.close(function() {
                setTimeout(done, 100);
            });
        },

        readdir: {

            nodeMode: {

                testGetsContents: function(test) {
                    wfs.readdir("/", function(err, files) {
                        test.ok(!err, "There should be no error getting contents");
                        test.ok(files.indexOf("index.txt") >= 0, "The directory should contain index.txt");
                        test.done();
                    });
                }

            },

            statMode: {

                testGetsContentsWithStat: function(test) {
                    wfs.readdir("/", function(err, files) {
                        var mapped = {};
                        test.ok(!err, "There should be no error getting contents");
                        files.forEach(function(fileStat) {
                            mapped[fileStat.name] = fileStat;
                        });
                        test.strictEqual(mapped["testdir"].isDirectory(), true, "'testdir' should be a directory");
                        test.strictEqual(mapped["index.txt"].isFile(), true, "'index.txt' should be a file");
                        test.strictEqual(mapped["bin.dat"].isFile(), true, "'bin.dat' should be a file");
                        test.strictEqual(mapped["bin.dat"].size, 1024, "'bin.dat' should be the correct size");
                        test.done();
                    }, "stat");
                }

            }

        }

    };

})(module);
