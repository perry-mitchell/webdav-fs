import { createClient } from "webdav";
import type {
    BufferLike,
    CreateReadStreamOptions,
    CreateWriteStreamOptions,
    FileStat,
    WebDAVClientOptions
} from "webdav";
import type { Readable, Writable } from "stream";
import { CallbackType, ExtCreateReadStreamOptions, FsStat, PathLike } from "./types";

const NOOP = () => {};
const TYPE_KEY = "@@fsType";

function __convertStat(data: FileStat): FsStat {
    return {
        isDirectory: function () {
            return data.type === "directory";
        },
        isFile: function () {
            return data.type === "file";
        },
        mtime: new Date(data.lastmod).getTime(),
        name: data.basename,
        size: data.size || 0
    };
}

function __executeCallbackAsync(callback: Function, ...args: any[]) {
    if (typeof setImmediate !== "undefined") {
        setImmediate(function () {
            callback.apply(null, ...args);
        });
    } else {
        setTimeout(function () {
            callback.apply(null, ...args);
        }, 0);
    }
}

export function createAdapter(webDAVEndpoint: string, options: WebDAVClientOptions = {}) {
    const client = createClient(webDAVEndpoint, options);
    return {
        [TYPE_KEY]: "webdav-fs",

        createReadStream: function (
            filePath: PathLike,
            options?: ExtCreateReadStreamOptions
        ): Readable {
            var clientOptions: CreateReadStreamOptions = {};
            if (options) {
                if (typeof options.headers === "object") {
                    clientOptions.headers = options.headers;
                }
                if (typeof options.start === "number") {
                    clientOptions.range = { start: options.start, end: options.end };
                }
            }
            return client.createReadStream(filePath, clientOptions);
        },

        createWriteStream: function (
            filePath: PathLike,
            options?: CreateWriteStreamOptions
        ): Writable {
            var clientOptions: CreateWriteStreamOptions = {};
            if (options) {
                if (typeof options.headers === "object") {
                    clientOptions.headers = options.headers;
                }
            }
            return client.createWriteStream(filePath, clientOptions);
        },

        mkdir: function (dirPath: PathLike, callback: CallbackType<void>): void {
            client
                .createDirectory(dirPath)
                .then(function () {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        readdir: function (
            dirPath: PathLike,
            modeOrCallback: "node" | "stat" | CallbackType<Array<string | FsStat>>,
            callback?: CallbackType<Array<string | FsStat>>
        ): void {
            let mode = typeof modeOrCallback === "string" ? modeOrCallback : "node";
            let callbackReal: CallbackType<Array<string | FsStat>> = NOOP;
            if (typeof modeOrCallback === "function") {
                callbackReal = modeOrCallback;
            } else if (callback !== undefined && typeof callback == "function") {
                callbackReal = callback;
            }
            client
                .getDirectoryContents(dirPath)
                .then(function (contents: Array<FileStat>) {
                    let results: Array<string | FsStat>;
                    if (mode === "node") {
                        results = contents.map(function (statItem) {
                            return statItem.basename;
                        });
                    } else if (mode === "stat") {
                        results = contents.map(__convertStat);
                    } else {
                        throw new Error("Unknown mode: " + mode);
                    }
                    __executeCallbackAsync(callbackReal, [null, results]);
                })
                .catch(callbackReal);
        },

        readFile: function (
            filename: PathLike,
            encodingOrCallback: "utf8" | "text" | "binary" | CallbackType<string | BufferLike>,
            callback?: CallbackType<string | BufferLike>
        ): void {
            let encoding = typeof encodingOrCallback === "string" ? encodingOrCallback : "text";
            let callbackReal: CallbackType<string | BufferLike> = NOOP;
            if (typeof encodingOrCallback === "function") {
                callbackReal = encodingOrCallback;
            } else if (callback !== undefined && typeof callback === "function") {
                callbackReal = callback;
            }
            encoding = encoding === "utf8" ? "text" : encoding;
            client
                .getFileContents(filename, { format: encoding })
                .then((data: string | BufferLike) => {
                    __executeCallbackAsync(callbackReal, [null, data]);
                })
                .catch(callbackReal);
        },

        rename: function (
            filePath: PathLike,
            targetPath: PathLike,
            callback: CallbackType<void>
        ): void {
            client
                .moveFile(filePath, targetPath)
                .then(function () {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        rmdir: function (targetPath: PathLike, callback: CallbackType<void>): void {
            client
                .deleteFile(targetPath)
                .then(function () {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        stat: function (remotePath: PathLike, callback: CallbackType<FsStat>): void {
            client
                .stat(remotePath)
                .then(function (stat) {
                    __executeCallbackAsync(callback, [null, __convertStat(stat as FileStat)]);
                })
                .catch(callback);
        },

        unlink: function (targetPath: PathLike, callback: CallbackType<void>) {
            client
                .deleteFile(targetPath)
                .then(function () {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        writeFile: function (
            filename: PathLike,
            data: BufferLike | string,
            encodingOrCallback?: "utf8" | "text" | "binary" | CallbackType<void>,
            callback?: CallbackType<void>
        ) {
            let encoding = typeof encodingOrCallback === "string" ? encodingOrCallback : "text";
            let callbackReal: CallbackType<void> = NOOP;
            if (typeof encodingOrCallback === "function") {
                callbackReal = encodingOrCallback;
            } else if (callback !== undefined && typeof callback === "function") {
                callbackReal = callback;
            }
            encoding = encoding === "utf8" ? "text" : encoding;
            client
                .putFileContents(filename, data /*{ format: encoding }*/)
                .then(function () {
                    __executeCallbackAsync(callbackReal, [null]);
                })
                .catch(callbackReal);
        }
    };
}
