# webdav-fs
Node `fs` wrapper for WebDAV. Perform basic filesystem tasks in a similar manner to using async `fs` methods like `readdir` and `writeFile`.

[![Build Status](https://travis-ci.org/perry-mitchell/webdav-fs.svg)](https://travis-ci.org/perry-mitchell/webdav-fs)

[![webdav-fs on npm](https://nodei.co/npm/webdav-fs.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/webdav-fs) [![NPM](https://nodei.co/npm-dl/webdav-fs.png?months=3&height=2)](https://nodei.co/npm/webdav-fs/)

## Installation

Install webdav-fs using npm:

```
npm install webdav-fs --save
```

## Example

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

## API

The following methods are available on the `webdav-fs` module:

### mkdir(path, callback)

Create a remote directory:

```javascript
wfs.mkdir("/remote/dir", function(error) {
    // handle error if truthy
});
```

### readdir(path, callback[, mode])

Read the contents of a remote directory:

```javascript
wfs.readdir("/some/remote/path/", function(error, contents) {
    // callback is an array of filenames
});
```

`mode` is an optional processing mode, where:

 * 'node' (the default mode) will output an array of filename strings
 * 'stat' will output an array of stat objects (plus a `name` field)

### readFile(path, [encoding,] callback)

Read the contents of a remote file:

```javascript
wfs.readFile("/website/index.php", "utf8", function(error, data) {
    // data is the contents of the file
    // encoding is optional
});
```

### rename(currentPath, destinationPath, callback)

Move/rename a file to another location/name. This does not create new directories for nested files (moving a file into a new directory will not work).

```javascript
wfs.rename("/my-document.docx", "/Documents/personal.docx", function (error) {
    // handle error
});
```

### stat(path, callback)

Stat a remote file:

```javascript
wfs.stat("/the-internet.dat", function(error, fileStat) {
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
wfs.unlink("/remote/path", function(error) {
    // handle error if truthy
});
```

### writeFile(path, data, [encoding,] callback)

Write data to a remote file:

```javascript
wfs.writeFile("/Temp/im-here.txt", "This is a saved file! REALLY!!", function(err) {
    console.error(err.message);
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
