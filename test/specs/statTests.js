(function(module) {

	"use strict";

	var webdavfs = require(__dirname + "/../../source/index.js"),
		wfs = webdavfs("http://localhost:9999/");

	var jsDAV = require("jsDAV/lib/jsdav"),
		jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

	module.exports = {

		setUp: function(done) {
			this.server = jsDAV.createServer({
				node: __dirname + "/../resources/",
				locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/data")
			}, 9999);
			setTimeout(done, 250);
		},

		tearDown: function(done) {
			this.server.close(function() {
				setTimeout(done, 100);
			});
		},

		stat: {

			testStatsDir: function(test) {
				wfs.stat("/dir1", function(err, stat) {
					test.ok(!err, "There should be no error getting stat");
					test.ok(stat.isDirectory(), "Stat should report target being a directory");
                    test.ok(!stat.isFile(), "Stat should report target not being a file");
					test.done();
				});
			},

            testStatsFile: function(test) {
				wfs.stat("/dir1/index.txt", function(err, stat) {
					test.ok(!err, "There should be no error getting stat");
                    test.ok(stat.isFile(), "Stat should report target being a file");
					test.ok(!stat.isDirectory(), "Stat should report target not being a directory");
					test.done();
				});
			}

		}

	};

})(module);
