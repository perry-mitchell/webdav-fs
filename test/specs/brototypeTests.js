(function(module) {

	"use strict";

	var Bro = require(__dirname + "/../../source/brototype.js");

	module.exports = {

		setUp: function(done) {
			this.bro = Bro({
				one: {
					small: {
						thing: 8
					}
				}
			});
			(done)();
		},

		iCanHaz1: {

			testSingleExisting: function(test) {
				test.strictEqual(this.bro.iCanHaz1("one.small.thing"), 8);
				test.done();
			},

			testSingleNonExisting: function(test) {
				test.strictEqual(this.bro.iCanHaz1("one.small.thingy"), undefined);
				test.done();
			},

			testMultiLastExisting: function(test) {
				test.strictEqual(this.bro.iCanHaz1(
					"two.small.thing", "one.small.thing"
				), 8);
				test.done();
			},

			testMultiFirstExisting: function(test) {
				test.strictEqual(this.bro.iCanHaz1(
					"one.small.thing", "two.small.thing"
				), 8);
				test.done();
			},

			testMultiNoneExisting: function(test) {
				test.strictEqual(this.bro.iCanHaz1(
					"one.small.thingy", "two.small.thing"
				), undefined);
				test.done();
			}

		}

	};

})(module);
