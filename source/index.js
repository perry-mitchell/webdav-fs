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

/**
 * Options for createReadStream
 * @typedef {Object} CreateReadStreamOptions
 * @property {Number=} start - Byte index to start the range at (inclusive)
 * @property {Number=} end - Byte index to end the range at (inclusive)
 * @property {Object=} headers - Optionally override the headers
 */

/**
 * Options for createWriteStream
 * @typedef {Object} CreateWriteStreamOptions
 * @property {Object=} headers - Optionally override the headers
 */

function createWebDAVfs(webDAVEndpoint, username, password, agent) {

    var client = createWebDAVClient(webDAVEndpoint, username, password, agent);

    return {

        // fs adapter type (for downstream integrations)
        [TYPE_KEY]: "webdav-fs",

        /**
         * Create a read stream for a remote file
         * @param {String} filePath The remote path
         * @param {CreateReadStreamOptions=} options Options for the stream
         * @returns {Readable} A readable stream
         */
        createReadStream: function(filePath, options) {
            var clientOptions = {};
            if (options && options !== null) {
                if (typeof options.headers === "object") {
                    clientOptions.headers = options.headers;
                }
                if (typeof options.start === "number") {
                    clientOptions.range = { start: options.start, end: options.end };
                }
            }
            return client.createReadStream(filePath, clientOptions);
        },

        /**
         * Create a write stream for a remote file
         * @param {String} filePath The remote path
         * @param {CreateWriteStreamOptions=} options Options for the stream
         * @returns {Writeable} A writeable stream
         */
        createWriteStream: function(filePath, options) {
            var clientOptions = {};
            if (options && options !== null) {
                if (typeof options.headers === "object") {
                    clientOptions.headers = options.headers;
                }
            }
            return client.createWriteStream(filePath, clientOptions);
        },

        /**
         * Create a remote directory
         * @param {String} dirPath The remote path to create
         * @param {Function} callback Callback: function(error)
         */
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

        /**
         * Read the contents of a remote file
         * @param {String} filename The remote file path to read
         * @param {String=} encoding Optional file encoding to read (utf8/binary) (default: utf8)
         * @param {Function} callback Callback: function(error, contents)
         */
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

        /**
         * Rename a remote item
         * @param {String} filePath The remote path to rename
         * @param {String} targetPath The new path name of the item
         * @param {Function} callback Callback: function(error)
         */
        rename: function(filePath, targetPath, callback) {
            client
                .moveFile(filePath, targetPath)
                .then(function() {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        /**
         * Remote remote directory
         * @todo Check if remote is a directory before removing
         * @param {String} targetPath Directory to remove
         * @param {Function} callback Callback: function(error)
         */
        rmdir: function(targetPath, callback) {
            client
                .deleteFile(targetPath)
                .then(function() {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        /**
         * Stat a remote item
         * @param {String} remotePath The remote item to stat
         * @param {Function} callback Callback: function(error, stat)
         */
        stat: function(remotePath, callback) {
            client
                .stat(remotePath)
                .then(function(stat) {
                    __executeCallbackAsync(callback, [null, __convertStat(stat)]);
                })
                .catch(callback);
        },

        /**
         * Unlink (delete) a remote file
         * @param {String} targetPath The remote file path to delete
         * @param {Function} callback Callback: function(error)
         */
        unlink: function(targetPath, callback) {
            client
                .deleteFile(targetPath)
                .then(function() {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        /**
         * Write data to a remote file
         * @param {String} filename The remote file path to write to
         * @param {Buffer|String} data The data to write
         * @param {String=} encoding Optional encoding to write as (utf8/binary) (default: utf8)
         * @param {Function} callback Callback: function(error)
         */
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

/**
 * Set the fetch-style method to use for requests
 * This overrides the built-in fetch function in `webdav-client`, which is
 * `node-fetch`.
 * @see https://github.com/perry-mitchell/webdav-client#overriding-the-built-in-fetch-function
 */
createWebDAVfs.setFetchMethod = function setFetchMethod(fetchFn) {
    createWebDAVClient.setFetchMethod(fetchFn);
};

module.exports = createWebDAVfs;
