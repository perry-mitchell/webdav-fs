const path = require("path");
const fileExists = require("exists-file").sync;
const directoryExists = require("directory-exists").sync;

const sourceDir = path.resolve(__dirname, "../testContents/child-ü-1");
const targetDir = path.resolve(__dirname, "../testContents/base-ü-1/child-ü-1");
const TEST_CONTENTS = path.resolve(__dirname, "../testContents");

describe("copy", function () {
    const makeDir = (client, dir) =>
        new Promise((resolve, reject) => {
            client.mkdir(dir, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

    beforeEach(function () {
        setup.call(this);
        return makeDir(this.client, "/base-ü-1").then(() => makeDir(this.client, "/child-ü-1"));
    });

    afterEach(function () {
        tearDown.call(this);
    });

    it("can copy a directory containing special characters", function (done) {
        this.client.copy("/child-ü-1", "/base-ü-1/child-ü-1", function (err) {
            expect(err).to.be.null;
            expect(directoryExists(sourceDir)).to.be.true;
            expect(directoryExists(targetDir)).to.be.true;
            done();
        });
    });

    it("can copy a file", function (done) {
        this.client.copy("/fractal.jpg", "/dir1/dir2/fractal.jpg", function (err) {
            expect(err).to.be.null;
            expect(fileExists(path.join(TEST_CONTENTS, "./fractal.jpg"))).to.be.true;
            expect(fileExists(path.join(TEST_CONTENTS, "./dir1/dir2/fractal.jpg"))).to.be.true;
            done();
        });
    });
});
