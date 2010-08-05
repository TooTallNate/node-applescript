
var spawn = require("child_process").spawn;

// Path to 'osascript'. By default search PATH.
exports.osascript = "osascript";

// Execute a *.applescript file.
exports.execFile = function execFile(file, args, callback) {
  if (!Array.isArray(args)) {
    callback = args;
    args = [];
  }
  return runApplescript(file, args, callback);
}

// Execute a String as AppleScript.
exports.execString = function execString(str, callback) {
  return runApplescript(str, callback);
}



function runApplescript(strOrPath, args, callback) {
  var needsE = false;
  if (!Array.isArray(args)) {
    callback = args;
    args = [];
    needsE = true;
  }
  
  // args get added in reverse order with 'unshift'
  args.unshift(strOrPath);
  if (needsE) {
    args.unshift("-e"); // If 'execString' was called
  }
  args.unshift("-ss"); // To output machine-readable text.
  
  var interpreter = spawn(exports.osascript, args);
  
  var stdout = "";
  interpreter.stdout.on('data', function (data) {
    stdout += data;
  });

  var stderr = "";
  interpreter.stderr.on('data', function (data) {
    stderr += data;
  });

  interpreter.on('exit', function (code) {
    var result = processOutput(stdout);
    callback(code, result, stderr);
  });
  
}

function processOutput(stdout) {
  // Output usually unnecessarily contains a \n
  // at the end, so let's remove it.
  if (stdout[stdout.length-1] == '\n') {
    stdout = stdout.substring(0, stdout.length-1);
  }
  
  // 'osascript' returns "Array"s that have {}
  // instead of []. We must replace them before
  // we can run them through JSON.parse
  var leftBracket = stdout.indexOf("{");
  var rightBracket = stdout.lastIndexOf("}");
  if (leftBracket >= 0 && rightBracket > 0) {
    stdout = '[' + stdout.substring(leftBracket+1, rightBracket) + ']';
  }
  
  // the 'alias' type represents a path on the
  // filesystem, in a weird format. Let's fix it.
  if (stdout.indexOf('alias "') != -1) {
    stdout = stdout.replace(/alias "/g, '"/Volumes/').replace(/:/g, "/");
  }
  
  // Finally try running the result through JSON.parse
  try {
    stdout = JSON.parse(stdout);
  } catch(e) {
    //console.error(e);
  }
  
  return stdout;
}
