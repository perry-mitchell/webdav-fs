(function(module) {

	"use strict";

	var request = require("request");

	module.exports = {

		getFile: function(auth, path, encoding) {
			encoding = encoding || "utf8";
			if (path[0] === "/") {
				path = path.substr(1);
			}
			return new Promise(function(resolve, reject) {
				request(
					{
						method: "GET",
						uri: auth.url + path,
						encoding: encoding
					},
					function(err, response, body) {
						if (err || response.statusCode !== 200) {
							(reject)(err || new Error("Bad response: " + response.statusCode));
						} else {
							(resolve)(body);
						}
					}
				);
			});
		}

	};

})(module);