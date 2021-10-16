"use strict";

const path = require("path");

const createWebDAVfs = require("../../source/index.js");
const { createWebDAVServer } = require("webdav/test/server/index.js");
const { PASSWORD, PORT, USERNAME } = require("webdav/test/server/credentials.js");

const expect = require("chai").expect;
const sinon = require("sinon");
const rimraf = require("rimraf").sync;
const copyDir = require("copy-dir").sync;

function createWebDAVClient() {
    return createWebDAVfs("http://localhost:" + PORT + "/webdav/server", {
        username: USERNAME,
        password: PASSWORD,
    });
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
