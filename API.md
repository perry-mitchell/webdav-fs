## Functions

<dl>
<dt><a href="#createWebDAVfs">createWebDAVfs(webDAVEndpoint, [options])</a></dt>
<dd><p>Create a new client adapter</p>
</dd>
<dt><a href="#createReadStream">createReadStream(filePath, [options])</a> ⇒ <code>Readable</code></dt>
<dd><p>Create a read stream for a remote file</p>
</dd>
<dt><a href="#createWriteStream">createWriteStream(filePath, [options])</a> ⇒ <code>Writeable</code></dt>
<dd><p>Create a write stream for a remote file</p>
</dd>
<dt><a href="#mkdir">mkdir(dirPath, callback)</a></dt>
<dd><p>Create a remote directory</p>
</dd>
<dt><a href="#readdir">readdir(path, [mode], callback)</a></dt>
<dd><p>Read a directory synchronously.
Maps -&gt; fs.readdir</p>
</dd>
<dt><a href="#readFile">readFile(filename, [encoding], callback)</a></dt>
<dd><p>Read the contents of a remote file</p>
</dd>
<dt><a href="#rename">rename(filePath, targetPath, callback)</a></dt>
<dd><p>Rename a remote item</p>
</dd>
<dt><a href="#rmdir">rmdir(targetPath, callback)</a></dt>
<dd><p>Remote remote directory</p>
</dd>
<dt><a href="#stat">stat(remotePath, callback)</a></dt>
<dd><p>Stat a remote item</p>
</dd>
<dt><a href="#unlink">unlink(targetPath, callback)</a></dt>
<dd><p>Unlink (delete) a remote file</p>
</dd>
<dt><a href="#writeFile">writeFile(filename, data, [encoding], callback)</a></dt>
<dd><p>Write data to a remote file</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#CreateReadStreamOptions">CreateReadStreamOptions</a> : <code>Object</code></dt>
<dd><p>Options for createReadStream</p>
</dd>
<dt><a href="#CreateWriteStreamOptions">CreateWriteStreamOptions</a> : <code>Object</code></dt>
<dd><p>Options for createWriteStream</p>
</dd>
<dt><a href="#ClientOptions">ClientOptions</a> : <code>Object</code></dt>
<dd><p>Adapter options, which match to the underlying WebDAV-client API:
 <a href="https://github.com/perry-mitchell/webdav-client/blob/master/API.md#module_WebDAV.createClient">WebDAV-Client API</a></p>
</dd>
<dt><a href="#ReadDirMode">ReadDirMode</a> : <code>&#x27;node&#x27;</code> | <code>&#x27;stat&#x27;</code></dt>
<dd><p>Readdir processing mode.
When set to &#39;node&#39;, readdir will return an array of strings like Node&#39;s
fs.readdir does. When set to &#39;stat&#39;, readdir will return an array of stat
objects.</p>
</dd>
</dl>

<a name="createWebDAVfs"></a>

## createWebDAVfs(webDAVEndpoint, [options])
Create a new client adapter

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| webDAVEndpoint | <code>String</code> | The WebDAV server URL |
| [options] | <code>Object</code> | Connection options for the client:  [WebDAV-Client API](https://github.com/perry-mitchell/webdav-client/blob/master/API.md#module_WebDAV.createClient) |

<a name="createWebDAVfs.setFetchMethod"></a>

### createWebDAVfs.setFetchMethod()
Set the fetch-style method to use for requests
This overrides the built-in fetch function in `webdav-client`, which is
`node-fetch`.

**Kind**: static method of [<code>createWebDAVfs</code>](#createWebDAVfs)  
**See**: https://github.com/perry-mitchell/webdav-client#overriding-the-built-in-fetch-function  
<a name="createReadStream"></a>

## createReadStream(filePath, [options]) ⇒ <code>Readable</code>
Create a read stream for a remote file

**Kind**: global function  
**Returns**: <code>Readable</code> - A readable stream  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> | The remote path |
| [options] | [<code>CreateReadStreamOptions</code>](#CreateReadStreamOptions) | Options for the stream |

<a name="createWriteStream"></a>

## createWriteStream(filePath, [options]) ⇒ <code>Writeable</code>
Create a write stream for a remote file

**Kind**: global function  
**Returns**: <code>Writeable</code> - A writeable stream  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> | The remote path |
| [options] | [<code>CreateWriteStreamOptions</code>](#CreateWriteStreamOptions) | Options for the stream |

<a name="mkdir"></a>

## mkdir(dirPath, callback)
Create a remote directory

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>String</code> | The remote path to create |
| callback | <code>function</code> | Callback: function(error) |

<a name="readdir"></a>

## readdir(path, [mode], callback)
Read a directory synchronously.
Maps -> fs.readdir

**Kind**: global function  
**See**: https://nodejs.org/api/fs.html#fs_fs_readdir_path_callback  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | The path to read at |
| [mode] | <code>String</code> | The readdir processing mode (default 'node') |
| callback | <code>function</code> | Callback: function(error, files) |

<a name="readFile"></a>

## readFile(filename, [encoding], callback)
Read the contents of a remote file

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | The remote file path to read |
| [encoding] | <code>String</code> | Optional file encoding to read (utf8/binary) (default: utf8) |
| callback | <code>function</code> | Callback: function(error, contents) |

<a name="rename"></a>

## rename(filePath, targetPath, callback)
Rename a remote item

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> | The remote path to rename |
| targetPath | <code>String</code> | The new path name of the item |
| callback | <code>function</code> | Callback: function(error) |

<a name="rmdir"></a>

## rmdir(targetPath, callback)
Remote remote directory

**Kind**: global function  
**Todo**

- [ ] Check if remote is a directory before removing


| Param | Type | Description |
| --- | --- | --- |
| targetPath | <code>String</code> | Directory to remove |
| callback | <code>function</code> | Callback: function(error) |

<a name="stat"></a>

## stat(remotePath, callback)
Stat a remote item

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The remote item to stat |
| callback | <code>function</code> | Callback: function(error, stat) |

<a name="unlink"></a>

## unlink(targetPath, callback)
Unlink (delete) a remote file

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| targetPath | <code>String</code> | The remote file path to delete |
| callback | <code>function</code> | Callback: function(error) |

<a name="writeFile"></a>

## writeFile(filename, data, [encoding], callback)
Write data to a remote file

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | The remote file path to write to |
| data | <code>Buffer</code> \| <code>String</code> | The data to write |
| [encoding] | <code>String</code> | Optional encoding to write as (utf8/binary) (default: utf8) |
| callback | <code>function</code> | Callback: function(error) |

<a name="CreateReadStreamOptions"></a>

## CreateReadStreamOptions : <code>Object</code>
Options for createReadStream

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [start] | <code>Number</code> | Byte index to start the range at (inclusive) |
| [end] | <code>Number</code> | Byte index to end the range at (inclusive) |
| [headers] | <code>Object</code> | Optionally override the headers |

<a name="CreateWriteStreamOptions"></a>

## CreateWriteStreamOptions : <code>Object</code>
Options for createWriteStream

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [headers] | <code>Object</code> | Optionally override the headers |

<a name="ClientOptions"></a>

## ClientOptions : <code>Object</code>
Adapter options, which match to the underlying WebDAV-client API:
 [WebDAV-Client API](https://github.com/perry-mitchell/webdav-client/blob/master/API.md#module_WebDAV.createClient)

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [username] | <code>String</code> | The username to use for authentication |
| [password] | <code>String</code> | The password to use for authentication |
| [httpsAgent] | <code>https.Agent</code> | Override for the HTTPS agent |
| [httpAgent] | <code>http.Agent</code> | Override for the HTTP agent |
| [token] | <code>Object</code> | Optional token override for OAuth |

<a name="ReadDirMode"></a>

## ReadDirMode : <code>&#x27;node&#x27;</code> \| <code>&#x27;stat&#x27;</code>
Readdir processing mode.
When set to 'node', readdir will return an array of strings like Node's
fs.readdir does. When set to 'stat', readdir will return an array of stat
objects.

**Kind**: global typedef  
**See**: stat  
