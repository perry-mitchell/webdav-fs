"use strict";

const path = require("path");

const createClient = require("../../source/index.js");
const createServer = require("webdav/test/server/index.js");

const expect = require("chai").expect;
const sinon = require("sinon");
const rimraf = require("rimraf").sync;
const copyDir = require("copy-dir").sync;

function createWebDAVClient() {
    return createClient(
        "http://localhost:" + createServer.test.port + "/webdav/server",
        {
            username: createServer.test.username,
            password: createServer.test.password
        }
    )
}

function createWebDAVServer() {
    return createServer(path.resolve(__dirname, "../testContents"));
}

function clean() {
    rimraf(path.resolve(__dirname, "../testContents"));
    copyDir(path.resolve(__dirname, "../serverContents"), path.resolve(__dirname, "../testContents"));
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
    tearDown: tearDown
});
