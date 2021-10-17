# WebDAV-FS
> Node FS wrapper for WebDAV services

Node `fs` wrapper for WebDAV. Perform basic filesystem tasks in a similar manner to using async `fs` methods like `readdir` and `writeFile`. `webdav-fs` uses [`webdav-client`](https://github.com/perry-mitchell/webdav-client) under the hood.

![build status](https://github.com/perry-mitchell/webdav-fs/actions/workflows/test.yml/badge.svg) [![npm version](https://badge.fury.io/js/webdav-fs.svg)](https://www.npmjs.com/package/webdav-fs) [![npm downloads](https://img.shields.io/npm/dm/webdav-fs.svg)](https://www.npmjs.com/package/webdav-fs)

## Installation

Install webdav-fs using npm:

```
npm install webdav-fs --save
```

Supports NodeJS 14 and above. For Node 10, use v3, for Node 8, use v2.

## Examples

You can use webdav-fs in authenticated or non-authenticated mode:

```typescript
// Using authentication:
import { createAdapter } from "webdav-fs";

const wfs = createAdapter("http://example.com/webdav/", {
    username: "username",
    password: "password"
});

wfs.readdir("/Work", (err, contents) => {
    if (!err) {
        console.log("Dir contents:", contents);
    } else {
        console.log("Error:", err.message);
    }
});
```

```typescript
// Without using authentication:
import { createAdapter } from "webdav-fs";

const wfs = createAdapter("http://example.com/webdav/");

wfs.stat("/report.docx", (err, data) => {
    console.log("Is file:", data.isFile());
});
```

For more control over the HTTP/TLS connection options, you can pass an instance of [`http.Agent`](https://nodejs.org/api/http.html#http_class_http_agent)
 or [`https.Agent`](https://nodejs.org/api/https.html#https_class_https_agent):

```typescript
import { Agent } from "https";
import { createAdapter } from "webdav-fs";

const agent = new Agent({
    keepAlive: true
    // we can also control certificate verification behaviour here
});

const wfs = createAdapter("https://example.com/webdav/", {
    username: "username",
    password: "password",
    httpsAgent: agent
});
```

## API

The following methods are available on the `webdav-fs` module:

### createReadStream(path[, options])

Create a read stream on a remote file:

```typescript
wfs
    .createReadStream("/dir/somefile.dat")
    .pipe(fs.createWriteStream("./somefile.dat"));
```

The `options` object supports overriding remote `headers` as well as a range (`start` and `end` as byte indexes). When specifying a range, only the `start` value is required (if `end` is not provided the rest of the file is read).

The following requests the first 300 bytes of a file:

```typescript
const myPartialStream = wfs.createReadStream("/dir/somefile.dat", { start: 0, end: 299 });
```

### createWriteStream(path[, options])

Create a write stream for a remote file:

```typescript
fs
    .createReadStream("./myFile.dat")
    .pipe(wfs.createWriteStream("/data/myFile.dat"));
```

The `options` object supports overriding remote `headers`.

### mkdir(path, callback)

Create a remote directory:

```typescript
wfs.mkdir("/remote/dir", err => {
    // handle error if truthy
});
```

### readdir(path[, mode], callback)

Read the contents of a remote directory:

```typescript
wfs.readdir("/some/remote/path/", "node", (err, contents) => {
    // callback is an array of filenames
});
```

`mode` is an optional processing mode, where:

 * 'node' (the default mode) will output an array of filename strings
 * 'stat' will output an array of stat objects (plus a `name` field)

### readFile(path, [encoding,] callback)

Read the contents of a remote file:

```typescript
wfs.readFile("/website/index.php", "utf8", (err, data) => {
    // data is the contents of the file
    // encoding is optional
});
```

`encoding` is optional and can be either `utf8` (default - returns a string) or `binary` (returns a `Buffer`).

### rename(currentPath, destinationPath, callback)

Move/rename a file to another location/name. This does not create new directories for nested files (moving a file into a new directory will not work).

```typescript
wfs.rename("/my-document.docx", "/Documents/personal.docx", err => {
    // handle error
});
```

### stat(path, callback)

Stat a remote file:

```typescript
wfs.stat("/the-internet.dat", (err, fileStat) => {
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

```typescript
wfs.unlink("/remote/path", (err) => {
    // handle error if truthy
});
```

### writeFile(path, data, [encoding,] callback)

Write data to a remote file:

```typescript
wfs.writeFile("/Temp/im-here.txt", "This is a saved file! REALLY!!", err => {
    if (err) {
        console.error(err.message);
    }
});
```

`writeFile` supports writing binary files as well:

```typescript
fs.readFile(sourceFile, "binary", (err, data) => {
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

### Browser usage and CORS
This library isn't exactly designed for use within the browser, although it might work if bundled using a tool like Webpack.

When in the browser take care with policies such as CORS - If the server is not configured correctly WebDAV requests will fail. Make sure that you return the correct CORS headers. Issues surrounding CORS errors without any indication that an error lies in this library will be closed.
