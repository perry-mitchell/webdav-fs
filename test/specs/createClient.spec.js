const createClient = require("../../source/index.js");
const { PASSWORD, PORT, USERNAME } = require("webdav/test/server/credentials.js");

const http = require("http");

describe("createClient", function () {
    beforeEach(function () {
        setup.call(this);
    });

    afterEach(function () {
        tearDown.call(this);
    });

    it("accepts an agent instance", function (done) {
        const agent = new http.Agent({});
        const client = createClient("http://localhost:" + PORT + "/webdav/server", {
            username: USERNAME,
            password: PASSWORD,
            httpAgent: agent,
        });
        client.readdir("/", (err, contents) => {
            expect(err).to.be.null;
            expect(contents).to.have.lengthOf(4);
            done();
        });
    });
});
