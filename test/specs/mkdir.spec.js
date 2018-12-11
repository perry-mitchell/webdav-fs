const path = require("path");
const directoryExists = require("directory-exists").sync;

const targetDir = path.resolve(__dirname, "../testContents/sub folder/new");

describe("mkdir", function() {
    beforeEach(function() {
        setup.call(this);
    });

    afterEach(function() {
        tearDown.call(this);
    });

    it("creates a directory", function(done) {
        expect(directoryExists(targetDir)).to.be.false;
        this.client.mkdir("/sub folder/new", err => {
            expect(err).to.be.null;
            expect(directoryExists(targetDir)).to.be.true;
            done();
        });
    });

    it("throws if directory already exists", function(done) {
        this.client.mkdir("/sub folder", err => {
            expect(err.message).to.match(/status code 405/i);
            done();
        });
    });
});
