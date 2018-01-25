# sitexml-node
SiteXML core node.js package

More about SiteXML: [sitexml.info](http://sitexml.info/)

## Usage

**1. Install**
```
> npm init
> npm install --save express sitexml
```

**2. Main app file (e.g. index.js)**

```
const express = require('express')
const sitexml = require('sitexml')

var app = express()

/* SiteXML */
app.use(express.urlencoded({extended:true}))
app.use(express.static(`${__dirname}/public/`, {dotfiles: 'allow'}))
app.use(sitexml.handler)
/* end SiteXML*/

app.listen(80)
```

**3. Create .site.xml file**

```
> mkdir public
> cd public
> echo "<site></site>" >> .site.xml
```

**4. Run**

```
> node index
```

The site should be running and accessible via HTTP
