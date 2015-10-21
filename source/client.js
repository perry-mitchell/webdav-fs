(function(module) {

	"use strict";

	var request = require("request"),
		xml2js = require("xml2js"),
		querystring = require("querystring");

	function processDirectoryResult(path, dirResult) {
		var items = [],
			responseItems = [];
		try {
			responseItems = dirResult["d:multistatus"]["d:response"] || [];
		} catch (e) {}
		responseItems.forEach(function(responseItem) {
			var props = responseItem["d:propstat"][0]["d:prop"][0];
			console.log(JSON.stringify(props, undefined, 4));

			var filename = processDirectoryResultFilename(
					path, 
					processXMLStringValue(responseItem["d:href"])
				).trim(),
				resourceType = processXMLStringValue(props["d:resourcetype"]),
				itemType = (resourceType.indexOf("d:collection") >= 0) ? "directory" : "file";
			if (filename.length <= 0) {
				return;
			}
			filename = querystring.unescape("/" + filename);
			var item = {
				filename: filename,
				lastmod: processXMLStringValue(props["d:getlastmodified"]),
				size: parseInt(processXMLStringValue(props["d:getcontentlength"]) || "0", 10),
				type: itemType
			};
			console.log("NEW:", item);
		})
		return items;
	}

	function processDirectoryResultFilename(path, resultFilename) {
		var pos = resultFilename.indexOf(path);
		if (pos >= 0) {
			return resultFilename.substr(pos);
		}
		return "";
	}

	function processXMLStringValue(xmlVal) {
		if (Array.isArray(xmlVal)) {
			if (xmlVal.length === 1) {
				return (xmlVal.length === 1 && typeof xmlVal[0] === "string") ? xmlVal[0] : JSON.stringify(xmlVal);
			} else {
				return JSON.stringify(xmlVal);
			}
		} else if (typeof xmlVal === "string") {
			return xmlVal;
		}
		return "";
	}

	module.exports = {

		getDir: function(auth, path) {
			if (path.length > 0 && path[0] === "/") {
				path = path.substr(1);
			}
			return new Promise(function(resolve, reject) {
				request(
					{
						method: "PROPFIND",
						uri: auth.url + path
					},
					function(err, response, body) {
						if (err || (response.statusCode < 200 && response.statusCode >= 300)) {
							(reject)(err || new Error("Bad response: " + response.statusCode));
						} else {
							var parser = new xml2js.Parser();
							parser.parseString(body, function (err, result) {
								if (err) {
									(reject)(err);
								} else {
									(resolve)(processDirectoryResult(path, result));
								}
							});
						}
					}
				);
			});
		},

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
		},

		putFile: function(auth, path, data, encoding) {
			encoding = encoding || "utf8";
			if (path[0] === "/") {
				path = path.substr(1);
			}
			return new Promise(function(resolve, reject) {
				request(
					{
						method: "PUT",
						uri: auth.url + path,
						encoding: encoding,
						body: data
					},
					function(err, response, body) {
						if (err || (response.statusCode < 200 && response.statusCode >= 300)) {
							(reject)(err || new Error("Bad response: " + response.statusCode));
						} else {
							(resolve)();
						}
					}
				);
			});
		}

	};

})(module);