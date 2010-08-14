
// 'parse' accepts a string that is expected to be the stdout stream of an
// osascript invocation. It reads the fist char of the string to determine
// the data-type of the result, and creates the appropriate type parser.
exports.parse = function(str) {
  //console.error(str);
  return parseFromFirstRemaining(str.split(''));
}

var WHITESPACE = /\s+/;

function parseFromFirstRemaining(str) {
  //console.error(str);
  while (WHITESPACE.test(str[0])) {
    str.shift();
  }
  switch(str[0]) {
    case '{':
      return ArrayParser(str);
      break;
    case '"':
      return StringParser(str);
      break;
    case 'a':
      if (str.slice(0,5).join('') == 'alias') {
        return AliasParser(str);
      }
      break;
  }
  if (!isNaN(str[0])) {
    return NumberParser(str);
  }
  return UndefinedParser(str);
}

// Parses an AppleScript "alias", which is really just a reference to a
// location on the filesystem, but formatted kinda weirdly.
function AliasParser(str) {
  str.splice(0,6);
  return "/Volumes/" + StringParser(str).replace(/:/g, "/");
}

// Parses an AppleScript Array. Which looks like {}, instead of JavaScript's [].
function ArrayParser(str) {
  var rtn = [];
  // 'first' should be a { char for a string.
  var first = str.shift();
  while (str[0] != '}') {
    rtn.push(parseFromFirstRemaining(str));
    if (str[0] == ',') str.shift();
  }
  str.shift();
  return rtn;
}

// Parses an AppleScript Number into a native JavaScript Number instance.
function NumberParser(str) {
  var rtn = [];
  while (!isNaN(str[0]) || str[0] == '.') {
    rtn.push(str.shift());
  }
  return Number(rtn.join(''));
}

// Parses a standard AppleScript String. Which starts and ends with "" chars.
// The \ char is the escape character, so anything after that is a valid part
// of the resulting String.
function StringParser(str) {
  var rtn = [];
  // 'first' should be a " char for a string.
  var first = str.shift();
  while(str[0] != '"') {
    if (str[0] == '\\') str.shift();
    rtn.push(str.shift());
  }
  str.shift();
  return rtn.join('');
}

// When the "parseFromFirstRemaining" function can't figure out the data type
// of "str", then the UndefinedParser is used. It crams everything it sees
// into a String, until it finds a ',' or a '}' or it reaches the end of data.
function UndefinedParser(str) {
  var rtn = [];
  while (str[0] && str[0] != '}' && str[0] != ',') {
    rtn.push(str.shift());
  }
  return rtn.join('');
}
