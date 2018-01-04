var fs = require('fs');
var Path = require('path');

var sitexml = {
  filename: '.site.xml',
  path: './',
  xml: {},
  encoding: "utf8"
}

sitexml.error = function(msg) {
  console.log("sitexml error: " + msg);
};

sitexml.getSiteXML = function() {
  var xml;
  var fullpath = Path.normalize(__dirname + this.path + this.filename);
  xml = fs.readFileSync(fullpath, this.encoding);
  return xml;
};

sitexml.setPath = function(path) {
  path = path || this.path;
  if (path.startsWith('./') || path.startsWith('.\\')) path = path.substring(1);
  if (!path.endsWith('/')) path = path + '/';
  var fullpath = Path.normalize(__dirname + path + this.filename);
  if (!fs.existsSync(fullpath)) {
    this.error(`path doesn't exist (${fullpath})`);
    process.exit();
  } else {
    this.path = path;
  }
};

module.exports = sitexml;
