const createClient = require("../../source/index.js");
const createServer = require("webdav/test/server/index.js");

const http = require("http");

describe("createClient", function() {
    beforeEach(function() {
        setup.call(this);
    });

    afterEach(function() {
        tearDown.call(this);
    });

    it("accepts an agent instance", function(done) {
        const agent = new http.Agent({});
        const client = createClient(
            "http://localhost:" + createServer.test.port + "/webdav/server",
            createServer.test.username,
            createServer.test.password,
            agent
        );
        client.readdir("/", (err, contents) => {
            expect(err).to.be.null;
            expect(contents).to.have.lengthOf(4);
            done();
        });
    });
});
