var sitexml = require('../sitexml')
var test = require('mztest');

sitexml.setPath('tests')
console.log(sitexml.path, sitexml.filename)

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
  sitexml.setPath('./tests');
  t.is(sitexml.path, '/tests/', "Set path");
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

//replaceThemePath
test(function(t) {
  var html = "abc <%THEME_PATH%> ghi"
  var string = "/some_/path/"
  var newHtml = sitexml.processor.replaceThemePath(html, string)
  var htmlCheck = "abc /.themes/some_/path/ ghi"
  t.is(newHtml, htmlCheck, "replaceThemePath 1")
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

//getPageHTMLByPageNode
test(function(t){
  var page = sitexml.getPageNodeById(10)
  var html = sitexml.getPageHTMLByPageNode(page);
  t.is(typeof html, "string", "Type of getPageHTMLByPageNode is string")
})

//getPageByAlias
test(function (t) {
  var alias = 'test/nocontent'
  var pIDCheck = 29
  var page = sitexml.getPageNodeByAlias(alias)
  t.is(page.getAttribute('id'), pIDCheck, 'getPageByAlias 1')
  page = sitexml.getPageNodeByAlias('/' + alias)
  t.is(page.getAttribute('id'), pIDCheck, 'getPageByAlias 2')
  page = sitexml.getPageNodeByAlias('/' + alias + '/')
  t.is(page.getAttribute('id'), pIDCheck, 'getPageByAlias 3')
  page = sitexml.getPageNodeByAlias(alias + '/')
  t.is(page.getAttribute('id'), pIDCheck, 'getPageByAlias 4')
})

//getPageThemeHtml
test(function(t){
  var page = sitexml.getPageNodeById(10)
  var themeHtml = sitexml.getPageThemeHtml(page)
  t.is(typeof themeHtml, 'string', 'getPageThemeHtml is string')
})

//getDefaultTheme
test(function(t){
  var theme = sitexml.getDefaultTheme()
  t.is(theme.getAttribute('id'), 3, 'getDefaultTheme 1')
})

//getPageThemeNode
test(function(t){
  var page = sitexml.getPageNodeById(29)
  var themeNode = sitexml.getPageThemeNode(page)
  t.is(themeNode.getAttribute('id'), 4, 'getPageThemeNode 1')
})

//sitexml.getMetaHtmlByNode
test(function(t){
  var pageNode = sitexml.getElementById('page', 29)
  var metas = pageNode.getElementsByTagName('meta')
  var checkHtml = [
    '<meta name="description" content="Special page with content file missing, for test reasons"></meta>',
    '<meta charset="utf-8"></meta>',
    '<meta name="keywords" content="test1, test2, test3"></meta>',
    '<meta name="description" content="Special page with content file missing, for test reasons"></meta>'
  ]
  var html = [
    sitexml.getMetaHtmlByNode(metas[0]),
    sitexml.getMetaHtmlByNode(metas[1]),
    sitexml.getMetaHtmlByNode(metas[2]),
    sitexml.getMetaHtmlByNode(metas[3])
  ]
  var i = 0;
  t.is(html[0], checkHtml[0], 'sitexml.getMetaHtmlByNode' + (++i))
  t.is(html[1], checkHtml[1], 'sitexml.getMetaHtmlByNode' + (++i))
  t.is(html[2], checkHtml[2], 'sitexml.getMetaHtmlByNode' + (++i))
  t.is(html[3], checkHtml[3], 'sitexml.getMetaHtmlByNode' + (++i))
})

//processor.replaceMeta
test(function(t) {
  var pageNode = sitexml.getElementById('page', 29)
  var metas = pageNode.getElementsByTagName('meta')
  var metaHtml = sitexml.getMetaHtmlByNode(metas[0])
  var html = "abc <%META%> def"
  var newHtml = sitexml.processor.replaceMeta(html, [metaHtml])
  var checkHtml = 'abc <meta name="description" content="Special page with content file missing, for test reasons"></meta> def'
  t.is(checkHtml, newHtml, 'processor.replaceMeta 1')
})

//getNaviHtml
test(function(t) {
  var navi = sitexml.getNaviHtml()
  t.is(typeof navi, 'string', "getNaviHtml")
})

test(function(t){
  t.is(true, sitexml.setSession(), "sitexml.setSession")
})

test(function(t){
  t.is(true, sitexml.checkSession(), "sitexml.checkSession")
})

test(function(t){
  var cid = 31, content = 'new test_string'
  t.is(true, sitexml.updateContent(cid, content), "sitexml.updateContent 1")
  t.is('new test_string', sitexml.getContentNodeTextContent(sitexml.getContentNodeById(31)), "sitexml.updateContent 2")
  sitexml.updateContent(cid, 'test_string\r\n')
})

test(function(t){
  var xml = sitexml.getSiteXML()
  t.is(true, sitexml.updateXML(xml), "sitexml.updateXML")
})

test(function(t){
  var xml = '<site/>'
  t.is(true, sitexml.siteXMLIsValid(xml), "sitexml.siteXMLIsValid")
})

//sitexml.aliasIsValid
test(function(t){
  t.is(false, sitexml.aliasIsValid(""), "sitexml.aliasIsValid (empty string)")
  t.is(false, sitexml.aliasIsValid(undefined), "sitexml.aliasIsValid (undefined)")
  t.is(false, sitexml.aliasIsValid(null), "sitexml.aliasIsValid (null)")
  t.is(true, sitexml.aliasIsValid(0), "sitexml.aliasIsValid (0)")
  t.is(true, sitexml.aliasIsValid("a"), "sitexml.aliasIsValid ('a')")
})

//getDirectChildNodes
/*
  Make sure that .site.xml has corresponding structure!
*/
test(function(t){
  let siteNode = sitexml.xmldoc.getElementsByTagName('site')[0]
  //direct child nodes of the SITE node
  let meta = sitexml.getDirectChildNodes(siteNode, 'META')
  t.is(1, Object.keys(meta).length, "sitexml.getDirectChildNodes (META)")
  meta = sitexml.getDirectChildNodes(siteNode, 'mEta')
  t.is(1, Object.keys(meta).length, "sitexml.getDirectChildNodes (mEta)")
  meta = sitexml.getDirectChildNodes(siteNode, 'theme')
  t.is(5, Object.keys(meta).length, "sitexml.getDirectChildNodes (theme))")
  let nothing = sitexml.getDirectChildNodes(siteNode, 'nothing')
  t.is(0, Object.keys(nothing).length, "sitexml.getDirectChildNodes (nothing)")
})


//processor.replaceNavi
test(function(t) {
  var html = "abc <%NAVI%> def"
  var navi = {
    'NAVI':
    '<li href="test_navi"/>'
  }
  var checkHtml = 'abc <li href="test_navi"/> def'
  sitexml.processor.parse(html)
  var newHtml = sitexml.processor.replaceNavi(html, navi)
  t.is(checkHtml, newHtml, "processor.replaceNavi")
})

//processor.parse
test(function(t){
  var html = "abc <%NAVI%> <%NAVI(1,2)%> <%TITLE%> <%CONTENT(main)%> <%META%> <%THEME_PATH%> <%sitename%>def"
  var commands = sitexml.processor.parse(html)
  t.is(7, commands.length, "processor.parse - 7 commands")
  t.is('NAVI', commands[0], "processor.parse - NAVI")
  t.is('NAVI(1,2)', commands[1], "processor.parse - NAVI(1,2)")
  t.is('TITLE', commands[2], "processor.parse - TITLE")
  t.is('CONTENT(MAIN)', commands[3], "processor.parse - CONTENT(MAIN)")
  t.is('META', commands[4], "processor.parse - META")
  t.is('THEME_PATH', commands[5], "processor.parse - THEME_PATH")
  t.is('SITENAME', commands[6], "processor.parse - SITENAME")
  t.is(true, sitexml.processor.buffer && sitexml.processor.buffer.normalized, 'processor.buffer.normalized is true')
  t.is(7, sitexml.processor.buffer && sitexml.processor.buffer.commands.length, 'processor.buffer.commands.length is 7')
  t.is("abc <%NAVI%> <%NAVI(1,2)%> <%TITLE%> <%CONTENT(MAIN)%> <%META%> <%THEME_PATH%> <%SITENAME%>def", sitexml.processor.buffer && sitexml.processor.buffer.normalizedThemeHtml, 'processor.buffer.normalizedThemeHtml')
})

test(function(t){
  var naviHtml = sitexml.getNaviHtmlFromCommand('NAVI(31)')
  var checkStr = '<ul class="siteXML-navi level-1"><li pid="32">Nested page 1 L1<ul class="siteXML-navi level-2"><li pid="33">Nested page L2</li></ul></li><li pid="34">Nested page 2 L1</li></ul>'
  t.is(checkStr, naviHtml, "sitexml - sitexml.getNaviHtmlFromCommand('NAVI(31)'")
  var naviHtml = sitexml.getNaviHtmlFromCommand('NAVI(31,2)')
    t.is(checkStr, naviHtml, "sitexml - sitexml.getNaviHtmlFromCommand('NAVI(31,2)'")
  var naviHtml = sitexml.getNaviHtmlFromCommand('NAVI(31,1)')
  var checkStr = '<ul class="siteXML-navi level-1"><li pid="32">Nested page 1 L1</li><li pid="34">Nested page 2 L1</li></ul>'
  t.is(checkStr, naviHtml, "sitexml - sitexml.getNaviHtmlFromCommand('NAVI(31,1)'")
})

//end and print stats
test(function(t) {
  t.end();
});
