var fs = require('fs')
var Path = require('path')
var express = require('express')
var DOMParser = require('xmldom').DOMParser
var processor = require('./processor.js')
var url = require('url')

var sitexml = {
  filename: '.site.xml',
  path: '/',
  xml: '',
  encoding: "utf8",
  xmldoc: null,
  processor,
  currentPID: null,
  basePath: null,
  publicDir: '../../public',
  silentMode: false,
  sitexml,
  url,
  path: Path
}

sitexml.init = function(opt = {}){
  if (opt.publicDir) this.publicDir = opt.publicDir
  this.setPath(this.publicDir)
  return this
}

sitexml.say = function(what) {
  if (!this.silentMode) console.log(what)
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

sitexml.getPageHTMLByPageNode = function(page) {
  var themeHtml = this.getPageThemeHtml(page) //first time selecting theme
  var themeNode = this.getPageThemeNode(page) //second time selecting theme (might need to refactor)
  var title = this.getPageTitle(page)
  var sitename = this.getSiteName(page)
  var themePath = themeNode.getAttribute('dir')
  var content = []
  var meta = []
  var navi = this.getNaviHtml()
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
  return this.processor.processPage({title, sitename, content, themeHtml, themePath, meta, navi})
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

sitexml.getNaviHtml = function(node, maxlevel = 0, level = 0) {
  level++;
  if (!node) node = this.xmldoc.getElementsByTagName('site')[0];
  var html = '';
  if (!maxlevel || maxlevel >= level) {
    var pages = node.getElementsByTagName('page')
    var page, liclass, href, contentNodes, pid, name
    for (var i = 0; i < pages.length; i++) {
      page = pages[i]
      if (page.getAttribute('nonavi') == "yes") continue
      pid = page.getAttribute('id')
      liclass = (pid == this.currentPID) ? ' class="siteXML-current"' : ''
      href = (this.aliasIsValid(page.getAttribute("alias"))) ? '/' + page.getAttribute('alias') : '/?id=' + pid
      if (this.basePath) href = '/' + this.basePath + href
      contentNodes = page.getElementsByTagName('content')
      name = page.getAttribute('name') || "page" + pid
      if (contentNodes.length) {
        html += '<li' + liclass + ' pid="' + pid + '"><a href="' + href + '" pid="' + pid + '">' + name + '</a>';
      } else {
        html += '<li' + liclass + 'pid="' + pid + '">' + name + '';
      }
      html += this.getNaviHtml(page, maxlevel, level)
      html += '</li>';
    }
    if (html != '') html = `<ul class="siteXML-navi level-${level}">${html}</ul>`;
  }
  return html;
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

sitexml.saveContentNodeTextContent = function(c, content) {
  if (c) {
    var type = c.getAttribute('type')
    if (type == 'module') {
      return "error: content node is module type"
    } else {
      var filename = c.textContent
      var fullpath = Path.join(__dirname, this.path, '/.content/' + filename )
      if (fs.existsSync(fullpath)) {
        fs.writeFileSync(fullpath, content, {encoding: this.encoding})
        return true
      } else {
        return "error:  content file "+ filename +" doesn't exist"
      }
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

sitexml.saveSiteXML = function(xml) {
  var fullpath = Path.join(__dirname, this.path, this.filename)
  if (this.siteXMLIsValid(xml)) {
    fs.writeFileSync(fullpath, xml, this.encoding)
    return true
  } else {
    this.error('xml is not valid')
    return false
  }
}

/*
note:
npm xmldoc library doesn't validate xml, you can feed it with anything
so I am just checking the root element, which must be SITE
*/
sitexml.siteXMLIsValid = function (xml) {
  var xmldoc = new DOMParser().parseFromString(xml)
  return (xmldoc.childNodes['0'].nodeName == 'site')
}

sitexml.setPath = function(path) {
  path = path || this.path
  if (path.startsWith('./') || path.startsWith('.\\')) path = path.substring(1)
  if (!path.endsWith('/')) path = path + '/'
  var fullpath = Path.join(__dirname, path, this.filename)
  if (!fs.existsSync(fullpath)) {
    this.error(`Path doesn't exist (${fullpath})`)
    //process.exit()
  } else {
    this.path = path
  }
}

sitexml.setSession = function (login, password) {
  return true
}

sitexml.checkSession = function () {
  return true
}

sitexml.updateContent = function (cid, content) {
  var res = this.saveContentNodeTextContent(this.getContentNodeById(cid), content)
  if (res === true) {
    return true;
  } else {
    sitexml.error(res);
    return false;
  }
}

sitexml.updateXML = function (xml) {
  return this.saveSiteXML(xml)
}

sitexml.handler = function(req, res, next) {
  var sitexml = require('./sitexml')
  var path = require('path')
  var url = sitexml.url
  var url_parts = url.parse(req.url, true)
  var pathname = url_parts.pathname
  var query = url_parts.query
  var html

  // STP GET

  if (req.method == "GET") {

    //?sitexml
    if (query.sitexml !== undefined) {
      xml = sitexml.getSiteXML()
      sitexml.say("GET ?sitexml")
      res.set({'Content-Type': 'text/xml'})
      res.send(xml)
    } else

    //?id=X
    if (query.id !== undefined) {
      if (query.name !== undefined) {
        sitexml.say(`GET ?id=${query.id}&name=${query.name}`)
        html = sitexml.getContentByNameAndPageId(query.name, query.id)
      } else {
        sitexml.currentPID = query.id
        sitexml.say(`GET ?id=${query.id}`)
        html = sitexml.getPageById(query.id)
      }
      res.set('Content-Type', 'text/html')
      res.send(html)
    } else

    //?cid=X
    if (query.cid !== undefined) {
      sitexml.say(`GET ?cid=${query.cid}`)
      html = sitexml.getContentNodeTextContent(sitexml.getContentNodeById(query.cid))
      res.set('Content-Type', 'text/html')
      res.send(html)
    } else

    //?login
    if (query.login !== undefined) {
      sitexml.say(`GET ?login`)
      html = fs.readFileSync(path.join(__dirname, '_login.html'))
      res.set('Content-Type', 'text/html')
      res.send(html)
    } else

    //?logout
    if (query.logout !== undefined) {
      sitexml.say(`GET ?logout`)
      html = 'logged out'
      res.set('Content-Type', 'text/html')
      res.send(html)
    } else

    //all other
    {
      sitexml.say(`GET ${pathname}`)
      var page = sitexml.getPageNodeByAlias(pathname)
      if (page) {
        sitexml.currentPID = page.getAttribute('id')
        html = sitexml.getPageHTMLByPageNode(page)
        res.set('Content-Type', 'text/html')
        res.send(html)
      }
    }
  } else

  //STP POST
  if (req.method == "POST") {
    //?login
    if (query.login !== undefined) {
      sitexml.say(`POST ?login=${req.body.login}`)
      var login = req.body.login,      //
          password = req.body.password //note: this requires app.use(express.urlencoded({extended:true})) in the main app file
      var success = sitexml.setSession(login, password)
      if (success) {
        html = "logged in"
      } else
      res.set('Content-Type', 'text/html')
      res.send(html)
    } else

    // ?cid
    if (req.body.cid !== undefined) {
      sitexml.say(`POST ?cid=${req.body.cid}`)
      var content = req.body.content
      if (sitexml.updateContent(req.body.cid, content)) {
        html = "content saved"
      } else {
        html = "error saving content"
      }
      res.set('Content-Type', 'text/html')
      res.send(html)
    } else

    // ?xml
    if (req.body.sitexml !== undefined) {
      sitexml.say('POST ?sitexml')
      if (sitexml.updateXML(req.body.sitexml)) {
        html = "sitexml saved"
      } else {
        html = "error saving sitexml"
      }
      res.set('Content-Type', 'text/html')
      res.send(html)
    }
  }

  next()
}

sitexml.aliasIsValid = function(alias) {
  return (
    alias !== undefined
    &&
    alias !== ""
    &&
    alias !== null
  )
}

sitexml.getDirectChildNodes = function(node, name) {
  let res = {}, count = 0
  if (node && node.childNodes && name) {
    for (let key in node.childNodes) {
      // skip loop if the property is from prototype
      if (!node.childNodes.hasOwnProperty(key)) continue
      let obj = node.childNodes[key]
      if (obj.nodeName && name.toLowerCase && obj.nodeName.toLowerCase() === name.toLowerCase()) {
        res[count] = obj
        count++
      }
    }
  }
  return res
}

module.exports = sitexml.init()
