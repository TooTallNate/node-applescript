node-applescript
================

A high-level way to execute AppleScript code through NodeJS, and retrieve
the result as a native JavaScript object (when possible). In reality, this
module is just a simple wrapper around the Apple `osascript` command.

### Why?
AppleScripts are the only way to communicate and interact with certain
external OS X processes, for example [iTunes](http://www.itunes.com).

Requirements
------------

 * Mac (or Hackintosh) running [OS X](http://www.apple.com/macosx) (tested with Snow Leopard)
 * [NodeJS](http://nodejs.org) (v0.1.100 or newer)

Usage
-----

The `node-applescript` module provides `execString` and `execFile` functions
to easily execute AppleScript commands and buffer the output into a calback.

--------------------------------------------------------

    var applescript = require("node-applescript");
    
    // Very basic AppleScript command. Returns the song name of each
    // currently selected track in iTunes as an 'Array' of 'String's.
    var script = 'tell application "iTunes" to get name of selection';
    
    applescript.execString(script, function(err, rtn) {
      if (err) {
        // Something went wrong!
      }
      if (Array.isArray(rtn)) {
        rtn.forEach(function(songName) {
          console.log(songName);
        });
      }
    });

--------------------------------------------------------

`execFile` works the exact same way, except you pass the _path_ of the AppleScript
(`*.applescript`) file as the first argument instead of the command itself.
