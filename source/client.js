(function(module) {

    "use strict";

    var fetch = require("node-fetch"),
        xml2js = require("xml2js"),
        querystring = require("querystring"),
        pathTools = require("path"),
        Bro = require("./brototype.js"),
        Streamifier = require("streamifier");

    var STATUS_CODES = require("http").STATUS_CODES;

    /**
     * Fetch raw data from a node-fetch response
     * @param {Object} fetchResponse The response from node-fetch
     * @returns {Buffer}
     * @private
     * @static
     */
    function fetchRaw(fetchResponse) {
        return fetchResponse._decode().then(function() { return fetchResponse._raw; });
    }

    function getHTTPModule(protocol) {
        return (protocol === "https") ? require("https") : require("http");
    }

    function handleResponseError(res) {
        if (res.status >= 400) {
            var err = new Error("Bad response: " + res.status);
            err.httpStatusCode = res.status;
            throw err;
        }
        return res;
    }

    function processDirectoryResult(path, dirResult, targetOnly) {
        var items = [],
            responseItems = [],
            dirResultBro = Bro(dirResult);
        if (targetOnly === undefined) {
            targetOnly = false;
        }
        try {
            var multistatus = dirResultBro.iCanHaz1("d:multistatus", "D:multistatus");
            responseItems = Bro(multistatus).iCanHaz1("d:response", "D:response") || [];
        } catch (e) {}
        responseItems.forEach(function(responseItem) {
            var responseBro = Bro(responseItem),
                propstatBro = Bro(responseBro.iCanHaz1("d:propstat.0", "D:propstat.0")),
                props = propstatBro.iCanHaz1("d:prop.0", "D:prop.0"),
                propsBro = Bro(props);
            //console.log(JSON.stringify(props, undefined, 4));
            var filename = processDirectoryResultFilename(
                    path,
                    processXMLStringValue(responseBro.iCanHaz1("d:href", "D:href"))
                ).trim(),
                resourceType = processXMLStringValue(propsBro.iCanHaz1("d:resourcetype", "D:resourcetype")),
                itemType = (resourceType.indexOf("d:collection") >= 0 || resourceType.indexOf("D:collection") >= 0) ?
                    "directory" : "file";
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
                    lastmod: processXMLStringValue(propsBro.iCanHaz1("d:getlastmodified", "D:getlastmodified")),
                    size: parseInt(processXMLStringValue(propsBro.iCanHaz1("d:getcontentlength", "D:getcontentlength")) || "0", 10),
                    type: itemType
                },
                mime = propsBro.iCanHaz1("d:getcontenttype", "D:getcontenttype");
            if (mime) {
                item.mime = mime;
            }
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

    function removePathPrefixSlash(path) {
        if (path[0] === "/") {
            path = path.substr(1);
        }
        return path.trim();
    }

    function enforcePathPrefixSlash(path) {
        path = path.trim();
        if (path[0] !== "/") {
            path ="/" + path;
        }
        return path;
    }

    module.exports = {

        deletePath: function(auth, path) {
            path = removePathPrefixSlash(path);
            if (path.length <= 0 || path === "/") {
                throw new Error("Cannot delete root");
            }
            return fetch(auth.url + path, {
                    method: "DELETE"
                })
                .then(handleResponseError);
        },

        getDir: function(auth, path) {
            path = removePathPrefixSlash(path);
            if (path.length <= 0) {
                path = "/";
            }
            return fetch(auth.url + path, {
                    method: "PROPFIND",
                    headers: {
                        Depth: 1
                    }
                })
                .then(handleResponseError)
                .then(function(res) {
                    return res.text();
                })
                .then(function(body) {
                    var parser = new xml2js.Parser();
                    return new Promise(function(resolve, reject) {
                        parser.parseString(body, function (err, result) {
                            if (err) {
                                (reject)(err);
                            } else {
                                (resolve)(processDirectoryResult(path, result));
                            }
                        });
                    });
                });
        },

        getFile: function(auth, path, encoding) {
            encoding = (encoding || "utf8").toLowerCase();
            path = removePathPrefixSlash(path);
            return fetch(auth.url + path)
                .then(handleResponseError)
                .then(function(res) {
                    if (encoding === "utf8") {
                        return res.text();
                    }
                    return fetchRaw(res);
                });
        },

        getStat: function(auth, path) {
            path = removePathPrefixSlash(path);
            if (path.length <= 0) {
                path = "/";
            }
            return fetch(auth.url + path, {
                    method: "PROPFIND",
                    headers: {
                        Depth: 1
                    }
                })
                .then(handleResponseError)
                .then(function(res) {
                    return res.text();
                })
                .then(function(body) {
                    var parser = new xml2js.Parser();
                    return new Promise(function(resolve, reject) {
                        parser.parseString(body, function (err, result) {
                            if (err) {
                                (reject)(err);
                            } else {
                                (resolve)(processDirectoryResult(path, result, true));
                            }
                        });
                    });
                });
        },

        moveFile: function(auth, remoteFilePath, targetFilePath) {
            remoteFilePath = removePathPrefixSlash(remoteFilePath);
            targetFilePath = removePathPrefixSlash(targetFilePath);
            return fetch(auth.url + remoteFilePath, {
                    method: "MOVE",
                    headers: {
                        Destination: auth.url + targetFilePath
                    }
                })
                .then(handleResponseError);
        },

        putFile: function(auth, path, data, encoding) {
            encoding = (encoding || "utf8").toLowerCase();
            var mime;
            if (encoding === "utf8") {
                mime = "text/plain";
            } else if (encoding === "binary") {
                mime = "application/octet-stream";
                if (typeof data === "string") {
                    data = new Buffer(data, "binary");
                }
            } else {
                throw new Error("Unknown or unspecified encoding");
            }
            path = enforcePathPrefixSlash(path);
            var http = getHTTPModule(auth.protocol),
                headers = {
                    "Content-Type": mime,
                    "Content-Length": data.length
                };
            if (auth.username.length > 0) {
                headers.Authorization = "Basic " +
                    (new Buffer(auth.username + ":" + auth.password)).toString('base64');
            }
            return new Promise(function(resolve, reject) {
                var request = http.request(
                    {
                        host: auth.host,
                        port: auth.port,
                        path: path,
                        method: "PUT",
                        headers: headers
                    },
                    function(response) {
                        var statusCode = response.statusCode;
                        if (statusCode >= 400) {
                            var err = new Error("Server returned error: " + statusCode + " " +
                                STATUS_CODES[statusCode]);
                            err.httpStatusCode = statusCode;
                            (reject)(err);
                        } else {
                            (resolve)();
                        }
                    }
                );
                request.on("error", reject);
                request.write(data);
                request.end();
            });
        },

        putDir: function(auth, path) {
            path = removePathPrefixSlash(path);
            return fetch(auth.url + path, {
                    method: "MKCOL"
                })
                .then(handleResponseError);
        }

    };

})(module);
