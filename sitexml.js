var fs = require('fs')
var Path = require('path')
var DOMParser = require('xmldom').DOMParser
var processor = require('./processor.js')

var sitexml = {
  filename: '.site.xml',
  path: '/',
  xml: '',
  encoding: "utf8",
  xmldoc: null,
  processor
}

sitexml.init = function(){
  return this
}

sitexml.getSiteName = function(pageNode){
  this.xmldoc&&this.setXmlDoc()
  var site = this.xmldoc.getElementsByTagName('site');
  return site[0].getAttribute('name') || site[0].getAttribute('title')
}

sitexml.setXmlDoc = function(){
  sitexml.setPath('./public')
  this.xml = this.getSiteXML()
  this.xmldoc = new DOMParser().parseFromString(this.xml)
}

sitexml.error = function(msg) {
  console.log("sitexml error: " + msg)
}

sitexml.getPageById = function(id){
  if (id == undefined) return "error: no page id given"
  var page = this.getPageNodeById(id)
  return this.getPageHTMLByPageNode(page);
}

sitexml.getPageHTMLByPageNode = function(page){
  var themeHtml = this.getPageThemeHtml(page) //first time selecting theme
  var themeNode = this.getPageThemeNode(page) //second time selecting theme (might need to refactor)
  var title = this.getPageTitle(page)
  var sitename = this.getSiteName(page)
  var themePath = themeNode.getAttribute('dir')
  var content = []
  var meta = []
  var cs = page.getElementsByTagName('content')
  for (var i = 0; i < cs.length; i++) {
    content.push({
      name: cs[i].getAttribute('name'),
      html: this.getContentNodeTextContent(cs[i])
    })
  }
  var metas = themeNode.getElementsByTagName('meta')
  for (var i = 0; i < metas.length; i++) {
    var string = this.getMetaHtmlByNode(metas[i])
    meta.push(string)
  }
  var metas = page.getElementsByTagName('meta')
  for (var i = 0; i < metas.length; i++) {
    var string = this.getMetaHtmlByNode(metas[i])
    meta.push(string)
  }
  return this.processor.processPage({title, sitename, content, themeHtml, themePath, meta})
}

sitexml.getMetaHtmlByNode = function (metaNode) {
  var string = '<meta '
  if (metaNode.getAttribute('name'))
    string += 'name="' + metaNode.getAttribute('name') + '"'
  else if (metaNode.getAttribute('charset'))
    string += 'charset="' + metaNode.getAttribute('charset') + '"'
  else if (metaNode.getAttribute('http-equiv'))
    string += 'http-equiv="' + metaNode.getAttribute('http-equiv') + '"'
  else if (metaNode.getAttribute('scheme'))
    string += 'scheme="' + metaNode.getAttribute('scheme') + '"'
  if (metaNode.getAttribute('content'))
    string += ' content="' + metaNode.getAttribute('content') + '"'
  else if (metaNode.textContent)
    string += ' content="' + metaNode.textContent + '"'
  string += ">"
  string += '</meta>'
  return string
}

sitexml.getPageThemeNode = function (pageNode) {
  //console.log("pageNode", pageNode)
  var themeId = pageNode.getAttribute('theme')
  var themeNode = (themeId) ? sitexml.getThemeById(themeId) : sitexml.getDefaultTheme()
  return themeNode
}

sitexml.getPageThemeHtml = function(pageNode) {
  var themeNode = this.getPageThemeNode(pageNode)
  //console.log('theme selected: ', themeNode.getAttribute('id'))
  var themeHtml = sitexml.getThemeHTML(themeNode)
  return themeHtml
}

sitexml.getDefaultTheme = function(node) {
  var themes = sitexml.xmldoc.getElementsByTagName('theme')
  var theme = themes[0]
  for (var i = 0; i < themes.length; i++) {
    if (themes[i].getAttribute('default')) {
      theme = themes[i]
    }
  }
  return theme
}

sitexml.getThemeHTML = function(node) {
  if (!node) return "error: theme node is not specified"
  var path = node.getAttribute('dir')
  var filename = node.getAttribute('file')
  var fullpath = Path.join(__dirname, this.path, `/.themes/${path}/${filename}` )
  if (fs.existsSync(fullpath))
    return fs.readFileSync(fullpath, {encoding: this.encoding})
  else
    return "error: theme file " + `${path}/${filename}` + " doesn't exists"
}

sitexml.getPageTitle = function(node) {
  return node.getAttribute('title') || this.getSiteName() || ''
}

sitexml.getContentNodeById = function(id){
  if (id == undefined) return "error: no content id given"
  return this.getElementById('content', id)
}

sitexml.getContentNodeByNameAndPageId = function (name, id) {
  if (id == undefined) return "error: no page id given"
  if (name == undefined) return "error: no content name given"
  var page = this.getPageNodeById(id)
  var cs = page.getElementsByTagName('content')
  //console.log("LENGTH", cs.length, cs[0].getAttribute('name'), name)
  for (var i = 0; i < cs.length; i++) {
    if (cs[i].getAttribute('name') == name) {
      var c = cs[i]
    }
  }
  return c
}

sitexml.getContentNodeTextContent = function(c){
  if (c) {
    var type = c.getAttribute('type')
    if (type == 'module') {
      return "[ Module " + c.getAttribute('name') + ' ]'
    } else {
      var filename = c.textContent
      var fullpath = Path.join(__dirname, this.path, '/.content/' + filename )
      //console.log(c.getAttribute('id'), fullpath)
      if (fs.existsSync(fullpath))
        return fs.readFileSync(fullpath, {encoding: this.encoding})
      else
        return "error:  content file "+ filename +" doesn't exist"
    }
  } else {
    return "error:  content node is not specified"
  }
}

sitexml.getThemeById = function(id) {
  if (id == undefined) return "error: no theme id given"
  return this.getElementById('theme', id)
}

sitexml.getPageNodeById = function (id){
  if (id == undefined) return "error: no page id given"
  return this.getElementById('page', id)
}

sitexml.getPageNodeByAlias = function (alias){
  if (alias == undefined) return "error: no page alias given"
  if (!this.xmldoc) this.setXmlDoc()
  var pages = this.xmldoc.getElementsByTagName('page')
  for (var i = 0; i < pages.length; i++) {
    var pageAlias = pages[i].getAttribute('alias')
    //console.log(pageAlias, pageAlias.replace(/^\//, '').replace(/\/$/, ''), alias, alias.replace(/^\//, '').replace(/\/$/, ''))
    if (pageAlias.replace(/^\//, '').replace(/\/$/, '') == alias.replace(/^\//, '').replace(/\/$/, '')) {
      return pages[i]
    }
  }
}

sitexml.getElementById = function (name, id, parent) {
  if (id == undefined) return "error: no element id given"
  if (name == undefined) return "error: no element name given"
  if (!this.xmldoc) this.setXmlDoc()
  parent = parent || this.xmldoc
  var elements = parent.getElementsByTagName(name)
  for (var i = 0; i < elements.length; i++)
    if (elements[i].getAttribute('id') == id) return elements[i]
}

sitexml.getSiteXML = function() {
  var xml
  var fullpath = Path.join(__dirname, this.path, this.filename)
  xml = fs.readFileSync(fullpath, this.encoding)
  return xml
}

sitexml.setPath = function(path) {
  path = path || this.path
  if (path.startsWith('./') || path.startsWith('.\\')) path = path.substring(1)
  if (!path.endsWith('/')) path = path + '/'
  var fullpath = Path.join(__dirname, path, this.filename)
  if (!fs.existsSync(fullpath)) {
    this.error(`Path doesn't exist (${fullpath})`)
    process.exit()
  } else {
    this.path = path
  }
}

module.exports = sitexml.init()
