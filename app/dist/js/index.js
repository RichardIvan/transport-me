'use strict'

var lodash = require('lodash')

fetch('http://localhost:3000/journey')
  .then(response => response.json())
  .then(json => console.log(json))

