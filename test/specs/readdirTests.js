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

			testGetsContents: function(test) {
				wfs.readdir("/", function(err, files) {
					test.ok(!err, "There should be no error getting contents");
					test.ok(files.indexOf("index.txt") >= 0, "The directory should contain index.txt");
					test.done();
				});
			}

		}

	};

})(module);
