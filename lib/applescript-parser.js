
// 'parse' accepts a string that is expected to be the stdout stream of an
// osascript invocation. It reads the fist char of the string to determine
// the data-type of the result, and creates the appropriate type parser.
exports.parse = function(str) {
  //console.error(str);
  //var start = new Date;
  var rtn = parseFromFirstRemaining.call({
    value: str,
    index: 0
  });
  //console.error("Parse Time: " + (new Date - start) + "ms");
  return rtn;
}

var WHITESPACE = /\s+/;

function parseFromFirstRemaining() {
  var cur = this.value[this.index];
  switch(cur) {
    case '{':
      return ArrayParser.call(this);
      break;
    case '"':
      return StringParser.call(this);
      break;
    case 'a':
      if (this.value.substring(this.index, this.index+5) == 'alias') {
        return AliasParser.call(this);
      }
      break;
  }
  if (!isNaN(cur)) {
    return NumberParser.call(this);
  }
  return UndefinedParser.call(this);
}

// Parses an AppleScript "alias", which is really just a reference to a
// location on the filesystem, but formatted kinda weirdly.
function AliasParser() {
  this.index += 6;
  return "/Volumes/" + StringParser.call(this).replace(/:/g, "/");
}

// Parses an AppleScript Array. Which looks like {}, instead of JavaScript's [].
function ArrayParser() {
  var rtn = [],
    cur = this.value[++this.index];
  while (cur != '}') {
    rtn.push(parseFromFirstRemaining.call(this));
    if (this.value[this.index] == ',') this.index += 2;
    cur = this.value[this.index];
  }
  this.index++;
  return rtn;
}

// Parses an AppleScript Number into a native JavaScript Number instance.
function NumberParser() {
  return Number(UndefinedParser.call(this));
}

// Parses a standard AppleScript String. Which starts and ends with "" chars.
// The \ char is the escape character, so anything after that is a valid part
// of the resulting String.
function StringParser(str) {
  var end = this.index+1, cur = this.value[end++];
  // 'first' should be a " char for a string.
  while(cur != '"') {
    if (cur == '\\') end++;
    cur = this.value[end++];
  }
  var rtn = this.value.substring(this.index+1, end-1);
  this.index = end;
  return rtn;
}

// When the "parseFromFirstRemaining" function can't figure out the data type
// of "str", then the UndefinedParser is used. It crams everything it sees
// into a String, until it finds a ',' or a '}' or it reaches the end of data.
var END_OF_TOKEN = /}|,|\n/;
function UndefinedParser() {
  var end = this.index, cur = this.value[end++];
  while (!END_OF_TOKEN.test(cur)) {
    cur = this.value[end++];
  }
  var rtn = this.value.substring(this.index, end-1);
  this.index = end-1;
  return rtn;
}
