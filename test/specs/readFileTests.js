(function(module) {

	"use strict";

	var webdavfs = require(__dirname + "/../../source/index.js"),
		wfs = webdavfs("http://localhost:9999/");

	var jsDAV = require("jsDAV/lib/jsdav"),
		jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

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

		readFile: {

			testGetsTextContents: function(test) {
				wfs.readFile("/index.txt", function(err, contents) {
					test.ok(!err, "There should be no error getting file contents");
					test.ok(contents.indexOf("[INDEX.TXT]") === 0, "The contents should match the remote file");
					test.done();
				});
			},

			testGetsDataContents: function(test) {
				wfs.readFile("/index.txt", "binary", function(err, contents) {
					test.ok(!err, "There should be no error getting file contents");
					test.notStrictEqual(contents, "[INDEX.TXT]", "Contents should be a buffer");
					test.strictEqual(contents.length, 11, "Contents should be of a certain length");
					test.done();
				});
			},

			testGetsBinaryDataContents: function(test) {
				wfs.readFile("/bin.dat", "binary", function(err, contents) {
					test.ok(!err, "There should be no error getting file contents");
					test.strictEqual(contents.length, 1024, "Contents should be of a certain length");
					test.done();
				});
			}

		}

	};

})(module);
