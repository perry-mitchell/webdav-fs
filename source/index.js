(function(module) {

	"use strict";

	var client = require("./client.js"),
		processing = require("./processing.js");

	function executeCallbackAsync(callback, args) {
		if (typeof setImmediate !== "undefined") {
			setImmediate(function() {
				callback.apply(null, args);
			});
		} else {
			setTimeout(function() {
				callback.apply(null, args);
			}, 0);
		}
	}

	module.exports = function(webDAVEndpoint, username, password) {
		username = username || "";
		var accessURL = (username.length > 0) ? 
				webDAVEndpoint.replace(/(https?:\/\/)/i, "$1" + username + ":" + password + "@") :
				webDAVEndpoint,
			accessURLLen = accessURL.length;
		if (accessURL[accessURLLen - 1] !== "/") {
			accessURL += "/";
		}
		var endpoint = {
			url: accessURL,
			username: username,
			password: password
		};

		return {

			mkdir: function(path, callback) {
				client.putDir(endpoint, path)
					.then(function() {
						executeCallbackAsync(callback, [null]);
					})
					.catch(function(err) {
						executeCallbackAsync(callback, [err]);
					});
			},

			/**
			 * Read a directory synchronously.
			 * Maps -> fs.readdir
			 * @see https://nodejs.org/api/fs.html#fs_fs_readdir_path_callback
			 * @param {String} path The path to read at
			 * @param {Function} callback Callback: function(error, files)
			 */
			readdir: function(path, callback) {
				client.getDir(endpoint, path)
					.then(function(dirData) {
						(callback)(null, dirData.map(function(dirEntry) {
							return dirEntry.basename;
						}));
					})
					.catch(function(err) {
						(callback)(err, null);
					});
			},

			readFile: function(/* filename[, encoding], callback */) {
				var args = Array.prototype.slice.call(arguments),
					argc = args.length;
				if (argc <= 1) {
					throw new Error("Invalid number of arguments");
				}
				var path = args[0],
					encoding = (typeof args[1] === "string") ? args[1] : undefined,
					callback = function() {};
				if (typeof args[1] === "function") {
					callback = args[1];
				} else if (argc >= 3 && typeof args[2] === "function") {
					callback = args[2];
				}
				client.getFile(endpoint, path, encoding)
					.then(
						function(data) {
							executeCallbackAsync(callback, [null, data]);
						},
						function(err) {
							executeCallbackAsync(callback, [err, null]);
						}
					);
			},

			stat: function(path, callback) {
				client.getStat(endpoint, path)
					.then(function(data) {
						if (data.length === 1) {
							executeCallbackAsync(callback, [null, processing.createStat(data[0])]);
						} else {
							executeCallbackAsync(callback, [new Error("Invalid response"), null]);
						}
					})
					.catch(function(err) {
						executeCallbackAsync(callback, [err, null]);
					});
			},

			unlink: function(path, callback) {
				client.deletePath(endpoint, path)
					.then(function() {
						executeCallbackAsync(callback, [null]);
					})
					.catch(function(err) {
						executeCallbackAsync(callback, [err]);
					});
			},

			writeFile: function(/* filename, data[, encoding], callback */) {
				var args = Array.prototype.slice.call(arguments),
					argc = args.length;
				if (argc <= 2) {
					throw new Error("Invalid number of arguments");
				}
				var path = args[0],
					data = args[1],
					encoding = (argc >= 3 && typeof args[2] === "string") ? args[2] : undefined,
					callback = function() {};
				if (typeof args[2] === "function") {
					callback = args[2];
				} else if (argc >= 4 && typeof args[3] === "function") {
					callback = args[3];
				}
				client.putFile(endpoint, path, data, encoding)
					.then(
						function() {
							executeCallbackAsync(callback, [null]);
						},
						function(err) {
							executeCallbackAsync(callback, [err]);
						}
					);
			}

		};

	};

})(module);
