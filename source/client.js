(function(module) {

	"use strict";

	var request = require("request"),
		xml2js = require("xml2js"),
		querystring = require("querystring"),
		pathTools = require("path");

	function processDirectoryResult(path, dirResult, targetOnly) {
		var items = [],
			responseItems = [];
		if (targetOnly === undefined) {
			targetOnly = false;
		}
		try {
			var multistatus = dirResult["d:multistatus"] || dirResult["D:multistatus"];
			responseItems = multistatus["d:response"] || multistatus["D:response"] || [];
		} catch (e) {}
		responseItems.forEach(function(responseItem) {
			var propstat = responseItem["d:propstat"] && responseItem["d:propstat"][0] ||
					responseItem["D:propstat"] && responseItem["D:propstat"][0],
				props = propstat["d:prop"] && propstat["d:prop"][0] ||
					propstat["D:prop"] && propstat["D:prop"][0];
			//console.log(JSON.stringify(props, undefined, 4));
			var filename = processDirectoryResultFilename(
					path,
					processXMLStringValue(responseItem["d:href"] || responseItem["D:href"])
				).trim(),
				resourceType = processXMLStringValue(props["d:resourcetype"] || props["D:resourcetype"]),
				itemType = (resourceType.indexOf("d:collection") >= 0 || resourceType.indexOf("D:collection")) ? "directory" : "file";
			if (filename.length <= 0) {
				return;
			}
			if ((targetOnly && filename !== path) || (!targetOnly && filename === path)) {
				// skip self or only self
				return;
			}
			filename = querystring.unescape("/" + filename);
			var item = {
				filename: filename,
				basename: pathTools.basename(filename),
				lastmod: processXMLStringValue(props["d:getlastmodified"] || props["D:getlastmodified"]),
				size: parseInt(processXMLStringValue(props["d:getcontentlength"] || props["D:getcontentlength"]) || "0", 10),
				type: itemType
			};
			if (props["d:getcontenttype"] || props["D:getcontenttype"]) {
				item.mime = processXMLStringValue(props["d:getcontenttype"] || props["D:getcontenttype"]);
			}
			//console.log("NEW:", item);
			items.push(item);
		})
		return items;
	}

	function processDirectoryResultFilename(path, resultFilename) {
		var resultFLen = resultFilename.length;
		if (resultFilename[resultFLen - 1] === "/") {
			resultFilename = resultFilename.substr(0, resultFLen - 1);
		}
		if (path === "/" || path === "") {
			var resultParts = resultFilename.split("/");
			return resultParts[resultParts.length - 1];
		}
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

	function sanitiseRemotePath(path) {
		if (path[0] === "/") {
			path = path.substr(1);
		}
		return path.trim();
	}

	module.exports = {

		deletePath: function(auth, path) {
			path = sanitiseRemotePath(path);
			if (path.length <= 0 || path === "/") {
				throw new Error("Cannot delete root");
			}
			return new Promise(function(resolve, reject) {
				request(
					{
						method: "DELETE",
						uri: auth.url + path
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
		},

		getDir: function(auth, path) {
			path = sanitiseRemotePath(path);
			if (path.length <= 0) {
				path = "/";
			}
			return new Promise(function(resolve, reject) {
				request(
					{
						method: "PROPFIND",
						uri: auth.url + path,
						headers: {
							Depth: 1
						}
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
			path = sanitiseRemotePath(path);
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

		getStat: function(auth, path) {
			path = sanitiseRemotePath(path);
			if (path.length <= 0) {
				path = "/";
			}
			return new Promise(function(resolve, reject) {
				request(
					{
						method: "PROPFIND",
						uri: auth.url + path,
						headers: {
							Depth: 1
						}
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
									(resolve)(processDirectoryResult(path, result, true));
								}
							});
						}
					}
				);
			});
		},

		putFile: function(auth, path, data, encoding) {
			encoding = encoding || "utf8";
			path = sanitiseRemotePath(path);
			return new Promise(function(resolve, reject) {
				request(
					{
						method: "PUT",
						uri: auth.url + path,
						encoding: encoding,
						body: data
					},
					function(err, response, body) {
						if (err || (response.statusCode < 200 || response.statusCode >= 300)) {
							(reject)(err || new Error("Bad response: " + response.statusCode));
						} else {
							(resolve)();
						}
					}
				);
			});
		},

		putDir: function(auth, path) {
			path = sanitiseRemotePath(path);
			return new Promise(function(resolve, reject) {
				request(
					{
						method: "MKCOL",
						uri: auth.url + path
					},
					function(err, response, body) {
						if (err || (response.statusCode < 200 || response.statusCode >= 300)) {
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
