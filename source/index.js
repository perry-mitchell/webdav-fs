"use strict";

var TYPE_KEY = '@@fsType';

var createWebDAVClient = require("webdav");

function __convertStat(data) {
    return {
        isDirectory: function() {
            return data.type === "directory";
        },
        isFile: function() {
            return data.type === "file";
        },
        mtime: (new Date(data.lastmod)).getTime(),
        name: data.basename,
        size: data.size || 0
    };
}

function __executeCallbackAsync(callback, args) {
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

    var client = createWebDAVClient(webDAVEndpoint, username, password);

    return {

        // fs adapter type (for downstream integrations)
        [TYPE_KEY]: "webdav-fs",

        mkdir: function(dirPath, callback) {
            client
                .createDirectory(dirPath)
                .then(function() {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        /**
         * Readdir processing mode.
         * When set to 'node', readdir will return an array of strings like Node's
         * fs.readdir does. When set to 'stat', readdir will return an array of stat
         * objects.
         * @see stat
         * @typedef {('node'|'stat')} ReadDirMode
         */

        /**
         * Read a directory synchronously.
         * Maps -> fs.readdir
         * @see https://nodejs.org/api/fs.html#fs_fs_readdir_path_callback
         * @param {String} path The path to read at
         * @param {Function} callback Callback: function(error, files)
         * @param {ReadDirMode=} mode The readdir processing mode (default 'node')
         * @see ReadDirMode
         */
        readdir: function(dirPath, callback, mode) {
            mode = mode || "node";
            client
                .getDirectoryContents(dirPath)
                .then(function(contents) {
                    var results;
                    if (mode === "node") {
                        results = contents.map(function(statItem) {
                            return statItem.basename;
                        });
                    } else if (mode === "stat") {
                        results = contents.map(__convertStat);
                    } else {
                        throw new Error("Unknown mode: " + mode);
                    }
                    __executeCallbackAsync(callback, [null, results]);
                })
                .catch(callback);
        },

        readFile: function(/* filename[, encoding], callback */) {
            var args = Array.prototype.slice.call(arguments),
                argc = args.length;
            if (argc <= 1) {
                throw new Error("Invalid number of arguments");
            }
            var path = args[0],
                encoding = (typeof args[1] === "string") ? args[1] : "text",
                callback = function() {};
            if (typeof args[1] === "function") {
                callback = args[1];
            } else if (argc >= 3 && typeof args[2] === "function") {
                callback = args[2];
            }
            encoding = (encoding === "utf8") ? "text" : encoding;
            client
                .getFileContents(path, { format: encoding })
                .then(function(data) {
                    __executeCallbackAsync(callback, [null, data]);
                })
                .catch(callback);
        },

        rename: function(filePath, targetPath, callback) {
            client
                .moveFile(filePath, targetPath)
                .then(function() {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        stat: function(remotePath, callback) {
            client
                .stat(remotePath)
                .then(function(stat) {
                    __executeCallbackAsync(callback, [null, __convertStat(stat)]);
                })
                .catch(callback);
        },

        unlink: function(targetPath, callback) {
            client
                .deleteFile(targetPath)
                .then(function() {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        writeFile: function(/* filename, data[, encoding], callback */) {
            var args = Array.prototype.slice.call(arguments),
                argc = args.length;
            if (argc <= 2) {
                throw new Error("Invalid number of arguments");
            }
            var filePath = args[0],
                data = args[1],
                encoding = (argc >= 3 && typeof args[2] === "string") ? args[2] : "text",
                callback = function() {};
            if (typeof args[2] === "function") {
                callback = args[2];
            } else if (argc >= 4 && typeof args[3] === "function") {
                callback = args[3];
            }
            encoding = (encoding === "utf8") ? "text" : encoding;
            client
                .putFileContents(filePath, data, { format: encoding })
                .then(function() {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        }

    };

};
