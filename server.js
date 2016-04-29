'use strict';

// server run command || supervisor -- --harmony_destructuring app.js

var express = require('express')
  , http = require('http')
  , path = require('path')
  , reload = require('reload')
  , bodyParser = require('body-parser')
  , logger = require('morgan')
  , fetch = require('node-fetch')
  , fs = require('fs')
  , request = require('request');

var processJourneyRequest = require('./server/journey-request.js')
var parseURL = require('./server/extract-pathname.js')
// import processJourneyRequest from './server/journey-request.js'

var GtfsRealtimeBindings = require('gtfs-realtime-bindings');

let Papa = require('papaparse')
let jsonfile = require('jsonfile')

const URL = require('url-parse')

// var now = require("performance-now")
var _ = require('lodash')
// _.takeRight = require('lodash.takeright')
// let _.last = require('lodash/last')
// var prettyjson = require('prettyjson')
var moment = require('moment')

// var DataParser = require("./DataParser.js");
// var GTFS = require('./GTFS.js')
// var BART = require('./BART.js')
// var r = require('./Responses.js')

const pFlagIndex = process.argv.indexOf('-p')

const app = express()
const port = (pFlagIndex !== -1 ) ? process.argv[pFlagIndex + 1] : 1337

const publicDir = path.join(__dirname, '')

app.set('port', process.env.PORT || port)
app.use(logger('dev'))
app.use(bodyParser.json()) //parses json, multi-part (file), url-encoded
app.use('/js/', express.static('prod/js/'))
app.use('/css/', express.static('prod/css/'))
// app.use('/', express.static('/'))

// app.get('/', function(req, res) {
//   res.sendFile(path.join(publicDir, 'index.html'))
// })

app.get('/', function(req, res) {
  // console.log(req)
  res.sendFile(path.join(__dirname + '/prod/index.html'));

  // res.send('hello world')

})

app.get('/*.serviceworker.js', function(req, res) {
  // console.log(req)
  res.sendFile(path.join(__dirname + `/prod${req.originalUrl}`));

  // res.send('hello world')

})

app.get('/*.html', function(req, res) {
  // console.log(req)
  res.sendFile(path.join(__dirname + `/prod${req.originalUrl}`));

  // res.send('hello world')

})


app.get('/journey/*', (req, res) => {
  console.log('hello journey')
  // console.log(new URL(req.url))
  // console.log(req)
  var host = req.headers.host
  var url = host + req.url


  const dataFromURL = parseURL(url)

  // const endpoint = dataFromURL.endpoint
  const response = processJourneyRequest(host, dataFromURL)
  // console.log(response)
  processJourneyRequest(host, dataFromURL)
    .then(resp => {
      res.send(resp)
    })
    // .then(res.send)

  // res.json(response)
})

app.get('/stations/*', (req, res) => {
  const filePath = './gtfs/data/stops.txt'

  fs.readFile(filePath, 'utf-8', (err, filedata) => {
    Papa.parse(filedata, {
      complete(results) {
        let dropped = _(results.data).drop().dropRight().value()
        dropped = _.filter(dropped, (item) => {
          return item[0].indexOf('_') === -1
        })
        dropped = _.map(dropped, (station) => [station[0], station[1]])
        res.json(dropped)
        // console.log("Finished:", );
      }
    })
  })
})

app.get('/raw/*', (req, res) => {
  console.log('hello raw')
  const url = new URL(req.url)
  console.log('before the effin error')
  const pathname = _.takeRight(url.pathname.split('/'), 2)
  // .shift()
  console.log('got dat motherfukin request bitches')
  console.log(pathname)
  if(!pathname[0] || !pathname[1]) return

  let filePath
  switch (pathname[1]) {
    case 'trips':
      filePath = './gtfs/data/trips.txt'
      break
    case 'stops':
      filePath = './gtfs/data/stop_times.txt'
      break
    default:
      res.send('error')
  }

  fs.readFile(filePath, 'utf-8', (err, filedata) => {
    Papa.parse(filedata, {
      complete(results) {
        // console.log(results.data.length)
        const dropped = _(results.data).drop().dropRight().value()
        console.log(dropped.length)
        res.json(dropped)
        // console.log("Finished:", );
      }
    })
  })
})

app.get('/data/', (req, res) => {
  console.log('hello data')
  const url = new URL(req.url)

  const pathname = _.takeRight(url.pathname.split('/'), 2)
  console.log('got dat motherfukin request bitches')

  const filePaths = ['./gtfs/data/stop_times.txt', './gtfs/data/trips.txt']

  const promises = _.map(filePaths, (filePath) => {

    return new Promise((resolve, reject) => {
      
      fs.readFile(filePath, 'utf-8', (err, filedata) => {
        Papa.parse(filedata, {
          complete(results) {
            const dropped = _(results.data).drop().dropRight().value()
            resolve(dropped)
          }
        })
      })
    })
  })

  Promise.all( promises )
    .then(data => {

      // console.log( data )
      const [stops, trips] = data

      const tripObject = {}

      const groupedStops = _.groupBy(stops, (stop) => stop[0])
      // console.log(groupedStops)

      const group = _.groupBy(trips, (stop) => stop[6])
      // const groupKeys = Object.keys(group)
      _.forEach(group, (arrayOfLinesByLineName) => {

        // console.log(arrayOfLinesByLineName)
        const groupByDay = _.groupBy(arrayOfLinesByLineName, (line) => line[1])

        _.forEach(groupByDay, (routes) => {
          _.forEach(routes, (routeInfo) => {
            const lineNumber = routeInfo[6].substr(0, 2)
            const lineDay = routeInfo[1]
            const lineKey = routeInfo[2]
            if (tripObject[lineNumber] || (tripObject[lineNumber] = {}));
            if ( _.isArray(tripObject[lineNumber][lineDay]) || (tripObject[lineNumber][lineDay] = [] )) {
              tripObject[lineNumber][lineDay].push(groupedStops[lineKey])
            }
          })
        })
      })
      res.json(tripObject)
    })
})

app.get('/routes/*', (req, res) => {
  console.log('hello routes')
  const filePath = './backend/routes.json'
  console.log(filePath)

  jsonfile.readFile( filePath, (err, data) => {
    res.json(data)
  })
})

app.get('/realtime/*', (req, res) => {
  // const url = 'http://api.bart.gov/gtfsrt/tripupdate.aspx'
  const urlToFetch = 'http://api.bart.gov/gtfsrt/tripupdate.aspx'
  const requestSettings = { method: 'GET', url: urlToFetch, encoding: null }

  request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var feed = GtfsRealtimeBindings.FeedMessage.decode(body)
      res.json(feed.entity)
      // feed.entity.forEach(function(entity) {
      //   if (entity.trip_update) {
      //     res.json(entity.trip_update)
      //   }
      // })
    }
  })
})

var server = http.createServer(app)

reload(server, app)

server.listen(app.get('port'), function(){
  console.log("Web server listening on port " + app.get('port'));
});




