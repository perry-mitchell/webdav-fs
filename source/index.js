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

			readFile: function(/*path, encodingOrCallback, callback*/) {
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
				} else if (argc >= 2 && typeof args[2] === "function") {
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



		};

	};

})(module);
