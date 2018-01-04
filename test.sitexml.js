var sitexml = require('./sitexml')
var test = require('./mztest');

//initial
test(function(t){
  t.is(typeof sitexml, "object", 'Is Object');
})

//set path
test(function(t){
  sitexml.setPath('./public');
  t.is(sitexml.path, '/public/', "Set path");
});

//getSiteXML
test(function(t){
  var xml = sitexml.getSiteXML();
  t.is(typeof xml, 'string', "getSiteXML returns String");
});

//end and print stats
test(function(t){
  t.end();
});
