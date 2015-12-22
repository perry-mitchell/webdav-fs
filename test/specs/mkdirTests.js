(function(module) {

	"use strict";

	var webdavfs = require(__dirname + "/../../source/index.js"),
		wfs = webdavfs("http://localhost:9999/"),
		isThere = require("is-there"),
		rimraf = require("rimraf").sync;

	var jsDAV = require("jsDAV/lib/jsdav"),
		jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

	module.exports = {

		setUp: function(done) {
			this.server = jsDAV.createServer({
				node: __dirname + "/../resources/",
				locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/data")
			}, 9999);
			this.targetDir = __dirname + "/../resources/madedir";
			if (isThere(this.targetDir)) {
				rimraf(this.targetDir);
			}
			setTimeout(done, 250);
		},

		tearDown: function(done) {
			var targetDir = this.targetDir;
			this.server.close(function() {
				if (isThere(targetDir)) {
					rimraf(targetDir);
				}
				setTimeout(done, 100);
			});
		},

		mkdir: {

			testIsClean: function(test) {
				test.ok(!isThere(this.targetDir));
				test.done();
			},

			testCreatesDirectory: function(test) {
				var targetDir = this.targetDir;
				wfs.mkdir("/madedir", function(err, files) {
					test.ok(isThere(targetDir), "Directory should be present");
					test.done();
				});
			}

		}

	};

})(module);
