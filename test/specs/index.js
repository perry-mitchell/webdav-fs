"use strict";

const path = require("path");
const ws = require("webdav-server").v2;

const createWebDAVfs = require("../../source/index.js");
const { PASSWORD, PORT, USERNAME } = require("webdav/test/server/credentials.js");

const expect = require("chai").expect;
const sinon = require("sinon");
const rimraf = require("rimraf").sync;
const copyDir = require("copy-dir").sync;

/**
 * This is copied from 
 * https://github.com/perry-mitchell/webdav-client/blob/24e35322ad04a56abb8db54b1a06cb4a88120ef3/test/server/index.js
 * The original code "hardcodes" the server path which is unusable in require(),
 * thus we need to duplicate the source here.
 * Licensed under MIT License.
 * @param {*} dir
 * @param {*} authType
 * @returns
 */
function createServer(dir, authType) {
    if (!dir) {
        throw new Error("Expected target directory");
    }
    const userManager = new ws.SimpleUserManager();
    const user = userManager.addUser(USERNAME, PASSWORD);
    let auth;
    switch (authType) {
        case "digest":
            auth = new ws.HTTPDigestAuthentication(userManager, "test");
            break;
        case "basic":
        /* falls-through */
        default:
            auth = new ws.HTTPBasicAuthentication(userManager);
            break;
    }
    const privilegeManager = new ws.SimplePathPrivilegeManager();
    privilegeManager.setRights(user, "/", ["all"]);
    const server = new ws.WebDAVServer({
        port: PORT,
        httpAuthentication: auth,
        privilegeManager: privilegeManager,
        maxRequestDepth: Infinity,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
                "HEAD, GET, PUT, PROPFIND, DELETE, OPTIONS, MKCOL, MOVE, COPY",
            "Access-Control-Allow-Headers":
                "Accept, Authorization, Content-Type, Content-Length, Depth",
        },
    });
    // console.log(`Created server on localhost with port: 9988, and authType: ${authType}`);
    return {
        start: function start() {
            return new Promise(function (resolve) {
                server.setFileSystem("/webdav/server", new ws.PhysicalFileSystem(dir), function () {
                    server.start(resolve);
                });
            });
        },

        stop: function stop() {
            return new Promise(function (resolve) {
                server.stop(resolve);
            });
        },
    };
}

function createWebDAVClient() {
    return createWebDAVfs("http://localhost:" + PORT + "/webdav/server", {
        username: USERNAME,
        password: PASSWORD,
    });
}

function createWebDAVServer() {
    return createServer(path.resolve(__dirname, "../testContents"));
}

function clean() {
    rimraf(path.resolve(__dirname, "../testContents"));
    copyDir(
        path.resolve(__dirname, "../serverContents"),
        path.resolve(__dirname, "../testContents")
    );
}

function setup() {
    clean();
    this.server = createWebDAVServer();
    this.server.start();
    this.client = createWebDAVClient();
}

function tearDown() {
    this.server.stop();
}

Object.assign(global, {
    // cleanTestDirectory: clean,
    expect: expect,
    setup: setup,
    sinon: sinon,
    tearDown: tearDown,
});
