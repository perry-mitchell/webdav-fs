# webdav-fs
Node `fs` wrapper for WebDAV. Perform basic filesystem tasks in a similar manner to using async `fs` methods like `readdir` and `writeFile`. `webdav-fs` uses [`webdav-client`](https://github.com/perry-mitchell/webdav-client) under the hood.

[![Build Status](https://travis-ci.org/perry-mitchell/webdav-fs.svg)](https://travis-ci.org/perry-mitchell/webdav-fs) [![npm version](https://badge.fury.io/js/webdav-fs.svg)](https://www.npmjs.com/package/webdav-fs) [![npm downloads](https://img.shields.io/npm/dm/webdav-fs.svg)](https://www.npmjs.com/package/webdav-fs)

## Installation

Install webdav-fs using npm:

```
npm install webdav-fs --save
```

## Examples

You can use webdav-fs in authenticated or non-authenticated mode:

```javascript
// Using authentication:
var wfs = require("webdav-fs")(
    "http://example.com/webdav/",
    "username",
    "password"
);

wfs.readdir("/Work", function(err, contents) {
    if (!err) {
        console.log("Dir contents:", contents);
    } else {
        console.log("Error:", err.message);
    }
});
```

```javascript
// Without using authentication:
var wfs = require("webdav-fs")("http://example.com/webdav/");

wfs.stat("/report.docx", function(err, data) {
    console.log("Is file:", data.isFile());
});
```

For more control over the HTTP/TLS connection options, you can pass an instance of [`http.Agent`](https://nodejs.org/api/http.html#http_class_http_agent)
 or [`https.Agent`](https://nodejs.org/api/https.html#https_class_https_agent):

```javascript
var agent = require("https").Agent({
    keepAlive: true
    // we can also control certificate verification behaviour here
});

var wfs = require("webdav-fs")(
    "https://example.com/webdav/",
    "username",
    "password",
    agent
);
```


## API

You can read the [API documentation here](https://github.com/perry-mitchell/webdav-fs/blob/master/API.md), or check out the examples below.

The following methods are available on the `webdav-fs` module:

### createReadStream(path[, options])

Create a read stream on a remote file:

```javascript
wfs
    .createReadStream("/dir/somefile.dat")
    .pipe(fs.createWriteStream("./somefile.dat"));
```

The `options` object supports overriding remote `headers` as well as a range (`start` and `end` as byte indexes). When specifying a range, only the `start` value is required (if `end` is not provided the rest of the file is read).

The following requests the first 300 bytes of a file:

```javascript
var myPartialStream = wfs.createReadStream("/dir/somefile.dat", { start: 0, end: 299 });
```

### createWriteStream(path[, options])

Create a write stream for a remote file:

```javascript
fs
    .createReadStream("./myFile.dat")
    .pipe(wfs.createWriteStream("/data/myFile.dat"));
```

The `options` object supports overriding remote `headers`.

### mkdir(path, callback)

Create a remote directory:

```javascript
wfs.mkdir("/remote/dir", function(err) {
    // handle error if truthy
});
```

### readdir(path[, mode], callback)

Read the contents of a remote directory:

```javascript
wfs.readdir("/some/remote/path/", "node", function(err, contents) {
    // callback is an array of filenames
});
```

`mode` is an optional processing mode, where:

 * 'node' (the default mode) will output an array of filename strings
 * 'stat' will output an array of stat objects (plus a `name` field)

### readFile(path, [encoding,] callback)

Read the contents of a remote file:

```javascript
wfs.readFile("/website/index.php", "utf8", function(err, data) {
    // data is the contents of the file
    // encoding is optional
});
```

### rename(currentPath, destinationPath, callback)

Move/rename a file to another location/name. This does not create new directories for nested files (moving a file into a new directory will not work).

```javascript
wfs.rename("/my-document.docx", "/Documents/personal.docx", function (err) {
    // handle error
});
```

### stat(path, callback)

Stat a remote file:

```javascript
wfs.stat("/the-internet.dat", function(err, fileStat) {
    console.log(fileStat);
});
```

A stat has the following properties:

| Property | Type | Description |
| -------- | ---- | ----------- |
| isFile   | Function | Check if the item is a file |
| isDirectory | Function | Check if the item is a directory |
| mtime | Number | Last modification timestamp |
| size | Number | Size of the item in bytes |

### unlink(path, callback)

Delete a remote file or directory:

```javascript
wfs.unlink("/remote/path", function(err) {
    // handle error if truthy
});
```

### writeFile(path, data, [encoding,] callback)

Write data to a remote file:

```javascript
wfs.writeFile("/Temp/im-here.txt", "This is a saved file! REALLY!!", function(err) {
    if (err) {
        console.error(err.message);
    }
});
```

`writeFile` supports writing binary files as well:

```javascript
fs.readFile(sourceFile, "binary", function(err, data) {
    wfs.writeFile(destFile, data, "binary", function(err) {
        // handle error
    });
});
```

`writeFile` supports just a couple of encodings:
 * utf8
 * binary

When writing binary files, data must either be a binary string from a read file in Node (then passed to `new Buffer(data, "binary")`) or a Buffer.

## Usage

### Overriding the built-in fetch function
Under the hood, `webdav-client` uses [`node-fetch`](https://github.com/bitinn/node-fetch) to perform requests. This can be overridden by running the following:

```js
// For example, use the `fetch` method in the browser:
const createWebDAVfs = require("webdav-fs");
createWebDAVfs.setFetchMethod(window.fetch);
```

Refer to [`webdav-client`'s documentation](https://github.com/perry-mitchell/webdav-client#overriding-the-built-in-fetch-function) for more information.
