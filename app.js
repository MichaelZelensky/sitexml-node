const express = require('express')
const path = require('path')
const sitexml = require('./sitexml')
const url = require('url')

const app = express()

const port = 80

app.use(express.static(path.join(__dirname, 'public'), {dotfiles: 'allow'}))
sitexml.setPath('public')

//error
app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

// STP GET
app.get('*', function(req, res, next) {
  var url_parts = url.parse(req.url, true)
  var pathname = url_parts.pathname
  var query = url_parts.query

  //?xml
  if (query.xml !== undefined) {
    var xml = sitexml.getSiteXML()
    res.set({'Content-Type': 'text/xml'})
    res.send(xml)
  } else

  //?id=X
  if (query.id !== undefined) {
    if (query.name !== undefined) {
      var html = sitexml.getContentByNameAndPageId(query.name, query.id)
    } else {
      var html = sitexml.getPageById(query.id)
    }
    res.set('Content-Type', 'text/html')
    res.send(html)
  } else

  if (query.cid !== undefined) {
    var html = sitexml.getContentNodeTextContent(sitexml.getContentNodeById(query.cid))
    res.set('Content-Type', 'text/html')
    res.send(html)
  } else {
    var page = sitexml.getPageNodeByAlias(pathname)
    if (page) {
      var html = sitexml.getPageHTMLByPageNode(page)
      res.set('Content-Type', 'text/html')
      res.send(html)
    } else {
      next()
    }
  }
});

app.listen(port)
console.log(`Listening to port ${port}`)
console.log('SiteXML enabled')
