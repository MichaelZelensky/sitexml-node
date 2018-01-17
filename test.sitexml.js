var sitexml = require('./sitexml')
var test = require('mztest');

//initial
test(function(t){
  t.is(typeof sitexml, "object", 'Is Object');
  t.is(typeof sitexml.processor, "object", 'processor Is Object');
})

//init
test(function(t){
  var sitexml1 = sitexml.init()
  t.is(sitexml1, sitexml, "Init return sitexml object")
})

//set path
test(function(t){
  sitexml.setPath('./public');
  t.is(sitexml.path, '/public/', "Set path");
});

//getSiteXML
test(function(t){
  var xml = sitexml.getSiteXML();
  t.is(typeof xml, 'string', "getSiteXML returns String")
});

//getPageById
test(function(t){
  var html = sitexml.getPageById(1)
  t.is(typeof html, 'string', "getPageById returns String")
  html = sitexml.getPageById()
  t.is(html, 'error: no page id given', "getPageById with no parameters")
})

//getPageNodeById
test(function(t){
  var html = sitexml.getPageNodeById(1)
  t.is(typeof html, 'object', "getPageNodeById returns Element")
  html = sitexml.getPageNodeById()
  t.is(html, 'error: no page id given', "getPageNodeById with no parameters")
})

//getContentNodeById
test(function(t){
  var html = sitexml.getContentNodeById(1)
  t.is(typeof html, 'object', "getContentNodeById returns Object")
  var html = sitexml.getContentNodeById()
  t.is(html, 'error: no content id given', "getContentNodeById with no parameters")
})

//getThemeById
test(function(t){
  var theme = sitexml.getThemeById(1)
  t.is(typeof theme, 'object', "getThemeById returns String")
  var theme = sitexml.getThemeById()
  t.is(theme, 'error: no theme id given', "getThemeById with no parameters")
})

//getElementById
test(function(t){
  var html = sitexml.getElementById('page', 1)
  t.is(typeof html, 'object', "getElementById returns String")
  var html = sitexml.getElementById('page')
  t.is(html, 'error: no element id given', "getElementById with no parameters")
  var html = sitexml.getElementById(undefined, 1)
  t.is(html, 'error: no element name given', "getElementById with no parameters")
})

//getXmlDoc
test(function(t){
  sitexml.setXmlDoc()
  t.is(typeof sitexml.xmldoc, "object", "sitexml.xmldoc is object")
  //t.is(sitexml.xmldoc.name.toLowerCase(), "site", "sitexml.xmldoc.name is site")
  //console.log(typeof sitexml.xmldoc)
})

//getSiteName
test(function(t){
  var sitename = sitexml.getSiteName()
  t.is(sitename, 'SiteXML - website architecture standard', "getSiteName")
})

//getPageNodeById
test(function(t){
  var id = 1
  var page = sitexml.getPageNodeById(id)
  t.is(page&&page.tagName, 'page', 'getPageNodeById: page is found (name)!')
  t.is(page&&page.getAttribute('id'), id, 'getPageNodeById: page is found (id)!')
})

//getContentNodeByNameAndPageId
test(function(t){
  var c = sitexml.getContentNodeByNameAndPageId('main')
  t.is(c, 'error: no page id given', "getContentNodeByNameAndPageId with no page id", "getContentNodeByNameAndPageId 1 ")
  var c = sitexml.getContentNodeByNameAndPageId(undefined, 1)
  t.is(c, 'error: no content name given', "getContentNodeByNameAndPageId with no content name", "getContentNodeByNameAndPageId 2")
  var c = sitexml.getContentNodeByNameAndPageId('main', 1)
  t.is(typeof c, 'object', "getContentNodeByNameAndPageId 3")
})

//getContentNodeTextContent
test(function(t) {
  var c = sitexml.getContentNodeById(30)
  var text = sitexml.getContentNodeTextContent(c)
  t.is(text, "error:  content file not_existing.html doesn't exist", "getContentNodeTextContent 1")
  var text = sitexml.getContentNodeTextContent()
  t.is(text, "error:  content node is not specified", "getContentNodeTextContent 2")
  c = sitexml.getContentNodeById(31)
  text = sitexml.getContentNodeTextContent(c)
  t.is(text, "test_string\r\n", "getContentNodeTextContent 3")
})

//getThemeHTML
test(function(t){
  var node = sitexml.getThemeById(99)
  var theme = sitexml.getThemeHTML(node)
  t.is(theme, "test_theme\r\n", "getThemeById 1")
})

//replaceTitle
test(function(t) {
  var html = "abc <%TITLE%> ghi"
  var title = "def"
  var newHtml = sitexml.processor.replaceTitle(html, title)
  var htmlCheck = "abc def ghi"
  t.is(newHtml, htmlCheck, "replaceTitle 1")
})

//replaceSiteName
test(function(t) {
  var html = "abc <%SITENAME%> ghi"
  var string = "test_sitename"
  var newHtml = sitexml.processor.replaceSiteName(html, string)
  var htmlCheck = "abc test_sitename ghi"
  t.is(newHtml, htmlCheck, "replaceSiteName 1")
})

//replaceContent
test(function (t) {
  var html = "abc <%CONTENT(MAIN)%> ghi"
  var name = 'main'
  var content = "some_test_content"
  var htmlCheck = "abc some_test_content ghi"
  var newHtml = sitexml.processor.replaceContent(html, name, content)
  t.is(newHtml, htmlCheck, "replaceContent 1")
})

//normalizeThemeHtml
test(function(t){
  var html = "abc <% TIT le %> ghi"
  var htmlCheck = "abc <%TITLE%> ghi"
  var newHtml = sitexml.processor.normalizeThemeHtml(html)
  t.is(htmlCheck, newHtml, "normalizeThemeHtml 1")
})

//end and print stats
test(function(t){
  t.end();
});
