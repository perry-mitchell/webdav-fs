(function(module) {

	"use strict";

	var webdavfs = require(__dirname + "/../../source/index.js"),
		wfs = webdavfs("http://localhost:9999/"),
		fs = require("fs"),
		isThere = require("is-there"),
		rimraf = require("rimraf").sync;

	var jsDAV = require("jsDAV/lib/jsdav"),
		jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

	module.exports = {

		setUp: function(done) {
			this.targetDir = __dirname + "/../resources/dir-unlink/";
			if (isThere(this.targetDir)) {
				rimraf(this.targetDir);
			}
			fs.mkdirSync(this.targetDir);
			fs.writeFileSync(this.targetDir + "test.txt", "Test textual content");
			fs.writeFileSync(this.targetDir + "test2.txt", "Sibling file");
			this.server = jsDAV.createServer({
				node: this.targetDir,
				locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/data")
			}, 9999);
			setTimeout(done, 250);
		},

		tearDown: function(done) {
			var targetDir = this.targetDir;
			this.server.close(function() {
				setTimeout(function() {
					if (isThere(targetDir)) {
						rimraf(targetDir);
					}
					(done)();
				}, 100);
			});
		},

		unlink: {

			testDeletesFile: function(test) {
				var targetDir = this.targetDir;
				test.ok(isThere(this.targetDir + "test.txt"), "Test file should exist before starting");
				wfs.unlink("/test.txt", function(err) {
					test.ok(!err, "There should be no error when unlinking: " + err);
					test.ok(!isThere(targetDir + "test.txt"), "Test file should have been removed");
					test.ok(isThere(targetDir + "test2.txt"), "Test sibling file should not have been removed");
					test.done();
				});
			}

		}

	};

})(module);
