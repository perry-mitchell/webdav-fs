function streamToBuffer(stream) {
    const buffs = [];
    return new Promise(function(resolve) {
        stream.on("data", function(d) {
            buffs.push(d);
        });
        stream.on("end", function() {
            resolve(Buffer.concat(buffs));
        });
    });
}

describe("createReadStream", function() {
    beforeEach(function() {
        setup.call(this);
    });

    afterEach(function() {
        tearDown.call(this);
    });

    it("returns a read stream", function() {
        const stream = this.client.createReadStream("/fractal.jpg");
        expect(stream.readable).to.be.true;
    });

    it("creates a stream of the expected length", function() {
        const stream = this.client.createReadStream("/fractal.jpg");
        return streamToBuffer(stream).then(function(buff) {
            expect(buff.length).to.equal(70558);
        });
    });
});
