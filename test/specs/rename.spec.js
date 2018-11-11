const path = require("path");
const directoryExists = require("directory-exists").sync;

const targetDir = path.resolve(__dirname, "../testContents/base-ü-1/child-ü-1");

describe("mkdir", function() {
    const makeDir = (client, dir) => new Promise((resolve, reject) => {
        client.mkdir(dir, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });

    beforeEach(function() {
        setup.call(this);
        return makeDir(this.client, "/base-ü-1")
            .then(() => makeDir(this.client, "/child-ü-1"));
    });

    afterEach(function() {
        tearDown.call(this);
    });

    it("can rename and move a directory containing special characters", function(done) {
        this.client.rename("/child-ü-1", "/base-ü-1/child-ü-1", function (err) {
            expect(err).to.be.null;
            expect(directoryExists(targetDir)).to.be.true;
            done();
        });
    });
});
