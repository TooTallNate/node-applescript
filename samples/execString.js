var applescript = require("../lib/applescript");

// Very basic AppleScript command. Returns the song name of each
// currently selected track in iTunes as an 'Array' of 'String's.
var script = 'tell application "iTunes" to get name of selection';

applescript.execString(script, function(rtnCode, stdout, stderr) {
  if (rtnCode) {
    // Something went wrong!
  }

  if (Array.isArray(stdout)) {
    console.log("Currently selected tracks:");
    stdout.forEach(function(songName) {
      console.log("\t" + songName);
    });
  } else {
    console.log("No tracks are selected...")
  }
});
