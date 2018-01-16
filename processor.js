var fs = require('fs')
var processor = {
  encoding: "utf8"
}

processor.defaultThemeHtml = fs.readFileSync('./_default_theme.thm', processor.encoding)

/*
@returns {String} - final HTML of the page
@param {page} :
  themeHtml, content: [{name,html}], name, title
*/
processor.processPage = function(page){
  var html = page.themeHtml || this.defaultThemeHtml
  html = this.normalizeThemeHtml(html)
  html = this.replaceTitle(html, page.title)
  html = this.replaceSiteName(html, page.sitename)
  if (page.content)
  for (var i = 0; i < page.content.length; i++) {
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
  for (var i = 1; i < html.length; i++) {
    if (searchEnd && html[i - 1] + html[i] == '%>') {
      searchEnd = false;
      command = html.substr(start, i - start - 1).replace(/\s/g, '').toUpperCase()
      newHtml = newHtml + `<%${command}%>`
      end = i + 1
      //console.log('end', end, 'command', command)
    } else if (!searchEnd && html[i - 1] + html[i] == '<%') {
      start = i + 1
      //console.log('start', start)
      searchEnd = true
      command = ''
      newHtml = newHtml + html.substr(end, i - end - 1)
    }
  }
  if (!searchEnd) {
    newHtml = newHtml + html.substring(end)
  }
  return newHtml
}

/*
@returns {String}
*/
processor.replaceTitle = function(html, title){
  return html.replace(/<%TITLE%>/, title)
}

/*
@returns {String}
*/
processor.replaceSiteName = function(html, string){
  return html.replace(/<%SITENAME%>/, string)
}

module.exports = processor