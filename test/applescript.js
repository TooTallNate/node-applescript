var 
  applescript = require("../lib/applescript"),
  assert = require("assert");

describe("Applescript", function () {

  it("supports integer output", function (done) {
    applescript.execString("return 123", function (err, result) { 
      assert.equal(123, result);
      done();
    });
  });

  it("supports list output", function (done) {
    applescript.execString("return {1,2,3}", function (err, result) { 
      assert.deepEqual([1,2,3], result);
      done();
    });
  });

  it("supports real number output", function (done) {
    applescript.execString("return 3.14", function (err, result) { 
      assert.equal(3.14, result);
      done();
    });
  });

  it("supports list/record output", function (done) {
    applescript.execString(
      "return {true, 3.14, {name:\"John\", surname: \"Doe\"}}", 
      function (err, result) { 
        assert.deepEqual([true, 3.14, {name:"John", surname: "Doe"}], result);
        done();
      });
  });

});