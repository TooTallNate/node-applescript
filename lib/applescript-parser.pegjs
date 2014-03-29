/*
  Grammar for AppleScript machine readable format.

  Since there is no formal specification for the format returned by osascript,
  it was guessed from return values.

  This grammar was created with a lot of help from this example:
  https://github.com/dmajda/pegjs/blob/master/examples/json.pegjs
*/

{
  function pathFromAlias(alias) {
    return "/Volumes/" + alias.replace(/:/g, '/');
  }

  function createDate(value) {
    var dateText = value.replace(/^[\w]+,\s+/, "").replace(/ at /, " ");
    return new Date(dateText);
  }
}


start
  = v:value _* { return v; }

value
  = number
  / boolean 
  / alias
  / text
  / record
  / list
  / date
  / application
  / className


/* Common rules ------------------------------------------------------------- */
_ "whitespace"
  = [ \t\n\r]

valueSeparator = _* "," _*
nameSeparator  = _* ":" _*


/* Number (Integer/Real) ---------------------------------------------------- */
number "number"
  = "-"? int frac? exp? { return parseFloat(text()); }

digit         = [0-9]
nonZeroDigit  = [1-9]
e             = [eE]
exp           = e ("-" / "+")? digit+
frac          = "." digit+
int           = "0" / (nonZeroDigit digit*)


/* Boolean ------------------------------------------------------------------ */
boolean "boolean"
  = "true" { return true; } / "false" { return false; }


/* Alias -------------------------------------------------------------------- */
alias "alias"
  = "alias" _+ path:text { return pathFromAlias(path); }


/* Text --------------------------------------------------------------------- */
text "text"
  = '"' chars:char* '"' { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape         = "\\"
unescaped      = [\x20-\x21\x23-\x5B\x5D-\u10FFFF\n]
HEXDIG         = [0-9a-f]i


/* List --------------------------------------------------------------------- */
list "list"
  = "{"
    values:(
      first:value
      rest:(valueSeparator v:value { return v; })*
      { return [first].concat(rest); }
    )?
    "}"
    { return values !== null ? values : []; }


/* Record ------------------------------------------------------------------- */
record "record"
  = "{"
    members:(
      first:member
      rest:(valueSeparator m:member { return m; })*
      {
        var result = {}, i;

        result[first.name] = first.value;

        for (i = 0; i < rest.length; i++) {
          result[rest[i].name] = rest[i].value;
        }

        return result;
      }
    )?
    "}"
    { return members !== null ? members: {}; }

member
  = name:identifier nameSeparator value:value {
      return { name: name, value: value };
    }

identifier
  = chars:nmchar+ { return chars.join(""); }

nmchar
  = [_a-z0-9-]i


/* Date --------------------------------------------------------------------- */
date "date"
  = "date" _+ value:text { return createDate(value); }


/* Application -------------------------------------------------------------- */
application "application"
  = "application" _+ appname:text { return {_application: appname }; }


/* Built-in classname ------------------------------------------------------- */
className "class name"
  = name:cname { return {_class: name }; }

cname
  = "alias"
  / "application"
  / "boolean"
  / "date"
  / "integer"
  / "real"
  / "text"
  / "list"
  / "class"