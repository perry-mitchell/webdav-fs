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
			this.targetDir = __dirname + "/../resources/dir-rename/";
            this.targetSubDir = this.targetDir + "sub/";
			if (isThere(this.targetDir)) {
				rimraf(this.targetDir);
			}
			fs.mkdirSync(this.targetDir);
            fs.mkdirSync(this.targetSubDir);
			fs.writeFileSync(this.targetDir + "test.txt", "Test textual content");
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

		rename: {

			testRenamesFile: function(test) {
				var targetDir = this.targetDir;
				wfs.rename("/test.txt", "/tested.dat", function(err) {
					test.ok(!err, "There should be no error when renaming: " + err);
					test.ok(!isThere(targetDir + "test.txt"), "Test file should have been moved away");
					test.ok(isThere(targetDir + "tested.dat"), "Test file should be with the new name");
					test.done();
				});
			},

            testMovesFile: function(test) {
                var targetDir = this.targetDir,
                    targetSubDir = this.targetSubDir;
				wfs.rename("/test.txt", "/sub/test.txt", function(err) {
					test.ok(!err, "There should be no error when renaming: " + err);
					test.ok(!isThere(targetDir + "test.txt"), "Test file should have been moved away");
					test.ok(isThere(targetSubDir + "test.txt"), "Test file should be in the subdirectory");
					test.done();
				});
            }

		}

	};

})(module);
