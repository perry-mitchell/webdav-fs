(function(module) {

	"use strict";

	var client = require(__dirname + "/client.js");

	module.exports = function(webDAVEndpoint, username, password) {
		var accessURL = webDAVEndpoint.replace(/(https?:\/\/)/i, "$1" + username +
			":" + password + "@"),
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
							(callback)(null, data);
						},
						function(err) {
							(callback)(err, null);
						}
					);
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
							(callback)(null);
						},
						function(err) {
							(callback)(err);
						}
					);
			}

		};

	};

})(module);
