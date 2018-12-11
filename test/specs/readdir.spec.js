const path = require("path");

describe("readdir", function() {

    beforeEach(function() {
        setup.call(this);
    });

    afterEach(function() {
        tearDown.call(this);
    });

    it("reads the contents of a directory", function(done) {
        this.client.readdir("/", (err, contents) => {
            expect(err).to.be.null;
            expect(contents).to.contain("sub folder");
            expect(contents).to.contain("fractal.jpg");
            done();
        });
    });

    it("reads the contents of a directory with spaces in its name", function(done) {
        this.client.readdir("/sub folder", (err, contents) => {
            expect(err).to.be.null;
            expect(contents).to.contain("file.txt");
            done();
        });
    });

    it("reads the contents of a directory with non-latin characters", function(done) {
        this.client.readdir("/방각하éàöåçΘΣฐ", (err, contents) => {
            expect(err).to.be.null;
            expect(contents).to.contain("file.txt");
            done();
        });
    });

    it("throws an error if the directory doesn't exist", function(done) {
        this.client.readdir("/non-existent", (err, contents) => {
            expect(err.message).to.match(/status code 404/i);
            done();
        });
    });

    it("returns only the expected contents when using trailing slashes (#56)", function(done) {
        this.client.readdir("/dir1/", (err, contents) => {
            expect(err).to.be.null;
            expect(contents).to.deep.equal(["dir2"]);
            done();
        });
    });

    describe("using mode 'stat'", function() {

        it("reads the contents of a directory", function(done) {
            this.client.readdir("/", "stat", (err, contents) => {
                expect(err).to.be.null;
                const subfolder = contents.find(item => item.name === "sub folder");
                const fractal = contents.find(item => item.name === "fractal.jpg");
                expect(subfolder).to.be.an("object");
                expect(fractal).to.be.an("object");
                done();
            });
        });

        it("provides isFile method", function(done) {
            this.client.readdir("/", "stat", (err, contents) => {
                expect(err).to.be.null;
                const fractal = contents.find(item => item.name === "fractal.jpg");
                expect(fractal).to.have.property("isFile").that.is.a("function");
                expect(fractal.isFile()).to.be.true;
                done();
            });
        });

        it("provides isDirectory method", function(done) {
            this.client.readdir("/", "stat", (err, contents) => {
                expect(err).to.be.null;
                const subfolder = contents.find(item => item.name === "sub folder");
                expect(subfolder).to.have.property("isDirectory").that.is.a("function");
                expect(subfolder.isDirectory()).to.be.true;
                done();
            });
        });

    });

});
