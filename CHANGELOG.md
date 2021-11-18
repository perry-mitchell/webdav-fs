# WebDAV-fs changelog

## v4.0.1
_2021-11-18_

 * **Bugfix**:
   * Package.json script entry incorrect

## v4.0.0
_2021-10-17_

 * Upgrade WebDAV client to v4
 * Typescript
 * Deprecate Node < 14

## v3.0.0
_2020-10-08_

 * Upgrade WebDAV client to 3.4.0
 * Deprecate Node 6 and 8 (min 10)
 * Upgrade all dependencies

## v2.0.0
_2018-12-11_

 * Upgrade webdav to 2.0.0
   * Use **axios** instead of node-fetch
 * Move `mode` parameter in `readdir` method (second optional parameter)

## v1.12.0
_2018-11-11_

 * Expose `agent` parameter in constructor to support custom HTTP/S agents being passed
 * Upgrade webdav to 1.6.1
   * **Bugfix**: Requests fail on Seafile instances
   * Removed restrictive namespace detection on responses

## v1.11.0
_2018-09-15_

 * Upgrade webdav to 1.6.0
   * **Bugfix**: Directory contents fetch fails on Windows
   * **Bugfix**: Moving items to directories with spaces fails
 * Update dependencies, audit

## v1.10.2
_2018-07-07_

 * Upgrade webdav to 1.5.3
   * Bugfix: Fix encoding issues with special characters

## v1.10.1
_2018-03-25_

 * Upgrade webdav to 1.5.2
   * ([#56](https://github.com/perry-mitchell/webdav-fs/issues/56)) `readdir` includes parent directory

## v1.10.0
_2018-03-24_

 * Upgrade webdav to 1.5.1
   * Fix path encoding bug
   * Add [OAuth2 authentication](https://github.com/perry-mitchell/webdav-client#authentication) support

## v1.9.0
_2018-03-15_

 * Upgrade webdav to 1.4.0 (Change deepmerge to merge)

## v1.8.0
_2018-02-25_

 * Upgrade webdav to 1.2.0 (Fix unicode paths)

## v1.7.0
_2018-02-21_

 * Update dependencies
 * Upgrade webdav to 1.1.2 (Fix directory contents bug)

## v1.6.0
_2017-11-12_

 * Upgrade webdav to 1.1.0

## v1.5.0
_2017-07-05_

 * Expose webdav's `setFetchMethod` function

## v1.4.0
_2017-07-03_

 * Upgrade webdav to 1.0.0-rc1
 * Add `createWriteStream` method

## v1.3.0
_2017-06-24_

 * Upgrade webdav to 0.10.0
   * Disable `window.fetch` for improved stability

## v1.2.0
_2017-06-08_

 * Add `createReadStream` method for streaming remote file contents (includes `start` and `end` support)

## v1.1.0
_2017-06-03_

 * Upgrade webdav to 0.7.0
   * Remove lodash

## **v1.0.0**
_2017-04-18_

 * Upgrade webdav to 0.6.0
   * Add support for non-prefixed response nodes
   * HTTP response codes in errors

## v1.0.0-rc7
_2017-02-11_

 * Upgrade webdav to 0.5.0
   * Use `window.fetch` where available

## v1.0.0-rc6
_2017-02-05_

 * Upgrade webdav to 0.4.1
   * Custom header support

## v1.0.0-rc5
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
