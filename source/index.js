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

			readFile: function(path, encodingOrCallback, callback) {
				var encoding = undefined;
				if (typeof encodingOrCallback !== "function") {
					encoding = encodingOrCallback;
				} else {
					callback = encodingOrCallback;
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
			}

		};

	};

})(module);
