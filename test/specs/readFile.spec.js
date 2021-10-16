describe("readFile", function() {
    beforeEach(function() {
        setup.call(this);
    });

    afterEach(function() {
        tearDown.call(this);
    });

    it("reads a remote file into a buffer", function(done) {
        this.client.readFile("/fractal.jpg", "binary", (err, data) => {
            expect(err).to.be.null;
            expect(data).to.be.an.instanceof(Buffer);
            expect(data).to.have.a.lengthOf(70558);
            done();
        });
    });

    it("reads a remote file into a string (default)", function(done) {
        this.client.readFile("/dir1/dir2/file.txt", (err, data) => {
            expect(err).to.be.null;
            expect(data).to.be.a("string");
            expect(data).to.have.a.lengthOf(8);
            done();
        });
    });

    it("reads a remote file into a string (specific)", function(done) {
        this.client.readFile("/dir1/dir2/file.txt", "utf8", (err, data) => {
            expect(err).to.be.null;
            expect(data).to.be.a("string");
            expect(data).to.have.a.lengthOf(8);
            done();
        });
    });
});
