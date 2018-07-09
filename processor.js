var fs = require('fs')
var path = require('path')

var processor = {
  encoding : "utf8",
  buffer : {
    commands : [],
    normalized : false,
    normalizedThemeHtml : ''
  }
}

processor.defaultThemeHtml = fs.readFileSync(path.join(__dirname, '/_default_theme.thm'), processor.encoding)

processor.parse = function (html) {
  var html = html || this.defaultThemeHtml
  this.buffer.normalizedThemeHtml = this.normalizeThemeHtml(html)
  return this.buffer.commands
}

/*
@returns {String} - final HTML of the page
@param {page} :
  themeHtml, content: [{name,html}], name, title
*/
processor.processPage = function(page){
  var html = this.buffer.normalizedThemeHtml || this.defaultThemeHtml
  if (!this.buffer.normalized) {
    html = this.normalizeThemeHtml(html)
  }
  if (page.title) html = this.replaceTitle(html, page.title)
  if (page.sitename) html = this.replaceSiteName(html, page.sitename)
  if (page.themePath) html = this.replaceThemePath(html, page.themePath)
  if (page.meta) html = this.replaceMeta(html, page.meta)
  if (page.navi) html = this.replaceNavi(html, page.navi)
  if (page.content) for (var i = 0; i < page.content.length; i++) {
    html = this.replaceContent(html, page.content[i].name, page.content[i].html)
  }
  return html
}

/*
@returns {String}
*/
processor.normalizeThemeHtml = function(html){
  var start,
      searchEnd,
      command,
      end = 0,
      newHtml = ''
  this.buffer.commands = []
  for (var i = 1; i < html.length; i++) {
    if (searchEnd && html[i - 1] + html[i] == '%>') {
      searchEnd = false;
      command = html.substr(start, i - start - 1).replace(/\s/g, '').toUpperCase()
      this.buffer.commands.push(command)
      newHtml = newHtml + `<%${command}%>`
      end = i + 1
    } else if (!searchEnd && html[i - 1] + html[i] == '<%') {
      start = i + 1
      searchEnd = true
      command = ''
      newHtml = newHtml + html.substr(end, i - end - 1)
    }
  }
  if (!searchEnd) {
    newHtml = newHtml + html.substring(end)
  }
  this.buffer.normalized = true;
  return newHtml
}

/*
@returns {String}
*/
processor.replaceThemePath = function(html, string){
  if (!string.match(/^\//)) string = "/" + string;
  if (!string.match(/\/$/)) string = string + "/";
  string = "/.themes" + string
  return html.replace(/<%THEME_PATH%>/g, string)
}

/*
@returns {String}
*/
processor.replaceTitle = function(html, title){
  return html.replace(/<%TITLE%>/g, title)
}

/*
@returns {String}
*/
processor.replaceSiteName = function(html, string){
  return html.replace(/<%SITENAME%>/g, string)
}

processor.replaceContent = function(html, name, content) {
  name = name.toUpperCase()
  return html.replace(`<%CONTENT(${name})%>`, content)
}

processor.replaceMeta = function(html, strings) {
  var metas = strings.join('\n')
  return html.replace(`<%META%>`, metas)
}

/*
@param {String} html
@param {Object} navi
@returns {String} html
*/
processor.replaceNavi = function (html, navi) {
  for (var key in navi) {
    if (navi.hasOwnProperty(key)) {
      html = html.replace('<%'+ key +'%>', navi[key])
    }
  }
  return html
}

processor.extractNavi = function (html) {
  let res = [], start = 0
  while (start >= 0) {
    pos = html.indexOf()
  }
}

module.exports = processor
