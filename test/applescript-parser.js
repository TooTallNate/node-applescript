var 
  parse = require("../lib/applescript-parser").parse,
  assert = require("assert");

describe("AppleScript Parser", function () {

  it("supports text", function () {
    assert.strictEqual("Hello", parse("\"Hello\""));
  });

  it("supports multi line text", function () {
    assert.strictEqual("Hello\nWorld", parse("\"Hello\nWorld\""));
  });

  it("supports integer", function () {
    assert.strictEqual(123, parse("123"));
  });

  it("supports real", function () {
    assert.strictEqual(3.14159, parse("3.14159"));
  });

  it("supports alias", function () {
    assert.strictEqual(
      "/Volumes/Macintosh HD/System/Library/CoreServices/Finder.app/",
      parse("alias \"Macintosh HD:System:Library:CoreServices:Finder.app:\"")
    );
  });

  it("supports application", function () {
    assert.deepEqual(
      {_application:"iTunes"}, 
      parse("application \"iTunes\"")
    );
  });

  it("supports boolean", function () {
    assert.equal(true, parse("true"));
    assert.equal(false, parse("false"));
  });

  it("supports class", function () {
    assert.deepEqual({_class:"integer"}, parse("integer"));
    assert.deepEqual({_class:"real"}, parse("real"));
    assert.deepEqual({_class:"text"}, parse("text"));
    assert.deepEqual({_class:"class"}, parse("class"));
    assert.deepEqual({_class:"application"}, parse("application"));
    assert.deepEqual({_class:"alias"}, parse("alias"));
    assert.deepEqual({_class:"date"}, parse("date"));
    assert.deepEqual({_class:"boolean"}, parse("boolean"));
  });

  it("supports single element list", function () {
    assert.deepEqual([1], parse("{1}"));
  });

  it("supports multi element list", function () {
    assert.deepEqual([1,2,3], parse("{1,2,3}"));
  });

  it("supports list with multiple types", function () {
    assert.deepEqual(
      [1, "Hello", true, 3.2], 
      parse("{1, \"Hello\", true, 3.2}"));
  });

  it("supports simple records", function () {
    assert.deepEqual(
      {name: "John", surname: "Doe"},
      parse("{name:\"John\", surname:\"Doe\"}")
    );
  });

  it("supports nested records", function () {
    assert.deepEqual(
      {name:"John", location: {id: 1, name: "test"} },
      parse("{name:\"John\", location:{id:1, name:\"test\"}}")
    );
  });

  it("supports records with lists", function () {
    assert.deepEqual(
      {name:"John", keys: [1,2,3]},
      parse("{name:\"John\", keys:{1,2,3}}")
    );
  });

  it("supports date", function () {
    assert.equal(
      new Date(2014, 2, 29, 1, 25, 32, 0).getTime(), 
      parse("date \"Saturday, March 29, 2014 at 1:25:32 AM\"").getTime()
    );
  });

  it("supports results in raw format", function () {
    assert.deepEqual({_raw: 'script Joe'}, parse("\xABscript Joe\xBB"));
  });

  it("return null if the input is empty", function () {
    assert.strictEqual(null, parse(""));
  });

  it("supports double quotes escaped", function () {
    assert.equal("\"hello\"", parse("\"\\\"hello\\\"\""));
  });

  it("supports unicode", function () {
    assert.equal("…", parse("\"…\""));
  });

});