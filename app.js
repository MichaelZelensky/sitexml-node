const express = require('express')
const path = require('path')
const sitexml = require('./sitexml')

const app = express()

const port = 80

//error
app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.use(express.static(path.join(__dirname, 'public'), {dotfiles: 'allow'}))
app.use(sitexml.handler)

app.listen(port)
console.log(`Listening to port ${port}`)
