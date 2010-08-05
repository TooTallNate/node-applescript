var applescript = require("../lib/node-applescript");

var file = require("path").join(__dirname, "locationCurrentTrack.applescript");

applescript.execFile(file, function(rtnCode, stdout, stderr) {
  if (rtnCode) {
    // Something went wrong!
  }
  console.log("The currently playing track is located at:\n\t"+stdout);
});
