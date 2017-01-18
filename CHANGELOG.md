# WebDAV-fs changelog

## v1.0.0-rc4
_2017-01-18_

 * Upgrade webdav (core) to 0.3.0
   * Remove node querystring dependency (downstream support)

## v1.0.0-rc3
_2017-01-17_

 * Added **type** flag for downstream (any-fs) recognition
 * Removed support for Node 0.12

## v1.0.0-rc2
_2016-10-24_

 * Updated webdav-client to 0.1.1
    * Fixes auth URLs with special characters in the username or password

## v1.0.0-rc1
_2016-10-15_

 * Integrated [webdav-client](https://github.com/perry-mitchell/webdav-client) and moved core functionality there.

## v0.7.1
_2016-10-01_

* Fixed a bug where `readFile` would return corrupted data when used in `"binary"` mode. The issue was to do with the [node-fetch](https://github.com/bitinn/node-fetch) package which didn't have appropriate support for buffer output at the time of original implementation. node-fetch was updated in this release.

## v0.7.0
_2016-08-02_

 * Added _stat_ support to `readdir`, which can now optionally return an array of stat objects instead of just filename strings. Due to complicated configurations like this, and their unintuitive nature in their default behaviour, **webdav-fs may drift from its fs alignment** at some stage in the near future (possibly for v1.0).

## v0.6.0
_2016-04-05_

 * Added support for renaming files and directories, which also allows for the moving of items.
