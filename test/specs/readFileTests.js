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

		readdir: {

			testGetsFileContents: function(test) {
				wfs.readFile("/index.txt", function(err, contents) {
					test.ok(!err, "There should be no error getting file contents");
					test.ok(contents.indexOf("[INDEX.TXT]") === 0, "The contents should match the remote file");
					test.done();
				});
			}

		}

	};

})(module);
