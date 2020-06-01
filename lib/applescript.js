var spawn = require("child_process").spawn;
exports.Parsers = require("./applescript-parser");
var parse = exports.Parsers.parse;

// Path to 'osascript'. By default search PATH.
exports.osascript = "osascript";

// Execute a *.applescript file.
exports.execFile = function execFile(file, args, callback, timeout) {
  if (!Array.isArray(args)) {
    callback = args;
    args = [];
  }
  return runApplescript(file, args, callback, timeout);
}

// Execute a String as AppleScript.
exports.execString = function execString(str, callback, timeout) {
  return runApplescript(str, callback, timeout);
}



function runApplescript(strOrPath, args, callback, timeout) {
  var isString = false;
  if (!Array.isArray(args)) {
    timeout = callback;
    callback = args;
    args = [];
    isString = true;
  }

  // args get added in reverse order with 'unshift'
  if (!isString) {
    // The name of the file is the final arg if 'execFile' was called.
    args.unshift(strOrPath);
  }
  args.unshift("-ss"); // To output machine-readable text.
  var interpreter = spawn(exports.osascript, args);

  bufferBody(interpreter.stdout);
  bufferBody(interpreter.stderr);

  interpreter.on('close', function(code) {
    var result = parse(interpreter.stdout.body);
    var err;
    if (code) {
      // If the exit code was something other than 0, we're gonna
      // return an Error object.
      err = new Error(interpreter.stderr.body);
      err.appleScript = strOrPath;
      err.exitCode = code;
    }
    if (callback) {
      callback(err, result, interpreter.stderr.body);
    }
  });

  if (isString) {
    // Write the given applescript String to stdin if 'execString' was called.
    interpreter.stdin.write(strOrPath);
    interpreter.stdin.end();
  }

  if (timeout) {
    setTimeout(function() {
      if (interpreter.exitCode == null) interpreter.kill()
    }, timeout);
  }
}

function bufferBody(stream) {
  stream.body = "";
  stream.setEncoding("utf8");
  stream.on("data", function(chunk) { stream.body += chunk; });
}
