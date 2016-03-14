'use strict';

var express = require('express')
  , http = require('http')
  , path = require('path')
  , reload = require('reload')
  , bodyParser = require('body-parser')
  , logger = require('morgan')
  , fetch = require('node-fetch')
  , prettyjson = require('prettyjson')
  , fs = require('fs');

var now = require("performance-now")

var DataParser = require("./DataParser.js");

var app = express()
var port = 9000

var publicDir = path.join(__dirname, '')

app.set('port', process.env.PORT || port)
app.use(logger('dev'))
app.use(bodyParser.json()) //parses json, multi-part (file), url-encoded

// app.get('/', function(req, res) {
//   res.sendFile(path.join(publicDir, 'index.html'))
// })

app.get('/', function(req, res) {

  var obj

  // Read the file and send to the callback
  fs.readFile('data/trips.json', handleFile)

  // Write the callback function
  function handleFile(err, data) {
      if (err) throw err
      obj = JSON.parse(data)
      // You can now play with your datas

      console.log(prettyjson.render(obj))
      // DataParser.hello()
      res.send(obj)
  }


  // var host = req.hostname
  // var protocol = req.protocol
  // var url = protocol + '://' + host + ':' + port + path.join('/data/trips.json')
  // console.log(url)
  // res.send(url)
  // fetch(url).then((json) => {
  //   res.send(json.body)
  // }).catch(error => console.log(error))
})

var server = http.createServer(app)

//reload code here
//optional reload delay and wait argument can be given to reload, refer to [API](https://github.com/jprichardson/reload#api) below
reload(server, app)

server.listen(app.get('port'), function(){
  console.log("Web server listening on port " + app.get('port'));
});

// DataParser.saveStations().then((fireStations) => fireStations.val())
// .then((stations) => console.log(stations));

// var start = now();
// DataParser.getStations().then((fireResponse) => {
//   let end = now();
//   let duration = (start-end).toFixed(3);
//   console.log("Took "+duration+"ms");
  
//   return fireResponse.val()
  
// }).then((data) => console.log(data)).catch((e) => console.log(e));

// DataParser.saveRoutePairs();

var parseAll = function( dataStringToParse ) {
  return new Promise((resolve, reject) => {
    let result;

    var recursiveParsing = function( dateString ) {
      console.log(dateString);
      let s = dateString
      DataParser.parsePair(s).then((r) => {
        console.log('done');
        console.log(r)
        result = r;
        console.log(result !== 200);

        if ( result !== 200 ) {
          console.log('recursiveCall');
          recursiveParsing(result)
        } else {
          resolve('done')
        }

      })
    }

    recursiveParsing( dataStringToParse )
  });
}

let fri = '03/04/2016 2:00 AM'
let sat = '03/05/2016 2:00 AM'
let sun = '03/06/2016 2:00 AM'
let mon = '03/07/2016 2:00 AM'
let tue = '03/08/2016 2:00 AM'
let wed = '03/09/2016 2:00 AM'
let thu = '03/10/2016 2:00 AM'

let timeStampsArr = [mon, tue, wed, thu, fri, sat, sun]
let index = 0;

let loopIt = function( index ) {
  parseAll( timeStampsArr[index++] ).then(() => {
    console.log('ALL PARSING DONE');
    console.log('please reset the pairs');
    return DataParser.saveRoutePairs();
  }).then(() => {
    if (index !== timeStampsArr.length ) {
      console.log(index);
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      loopIt(index)
    }
  })
}

// loopIt(index)

// DataParser.parseByAllPairs()

let newParseAll = function( dataStringToParse ) {
  return DataParser.getAllPairs().then(allPairsToParse => {
    console.log(allPairsToParse);
    let appPairsPromises = allPairsToParse.map((Pair) => {

      return new Promise((resolve, reject) => {
        let result;

        let recursiveParsing = function( dateString, Pair ) {

          // console.log("LOGGING DATESTRING");
          // console.log(dateString);
          // console.log(pair);
          let s = dateString
          let pp = Pair

          DataParser.updatedParsePair(s, pp).then((r) => {
            // console.log('done');
            // console.log(r)
            result = r;
            // console.log(result !== 200);

            if ( result !== 200 ) {
              // console.log('recursiveCall');
              let rand = Math.round(Math.random() * 60000);
              setTimeout(function() {
                //alert('A');
                recursiveParsing(result.date, result.pair)
              }, rand);
              
            } else {
              resolve('done')
            }

          }).catch(e => {
            console.log(s);
            console.log(pp);
            console.log(e);
            recursiveParsing( e[0], e[1] )
          })
        }

        let rand = Math.round(Math.random() * 60000);
        setTimeout(function() {
          //alert('A');
          recursiveParsing( dataStringToParse, Pair ) 
        }, rand);

        
      });

    })

    // console.log(appPairsPromises);

    return Promise.all( appPairsPromises )

  })
  
}

let Fri = '03/04/2016 2:00 AM'
let Sat = '03/05/2016 2:00 AM'
let Sun = '03/06/2016 2:00 AM'
let Mon = '03/07/2016 2:00 AM'
let Tue = '03/08/2016 2:00 AM'
let Wed = '03/09/2016 2:00 AM'
let Thu = '03/10/2016 2:00 AM'

let timeStampsARR = [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
let Index = 0;

let newLoopIt = function( Index ) {
  newParseAll( timeStampsARR[Index++] ).then(() => {
    console.log('ALL PARSING DONE');
    console.log('please reset the pairs');
    return DataParser.saveRoutePairs();
  }).then(() => {
    if (Index !== timeStampsARR.length ) {
      console.log(Index);
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      console.log('LOOOOOP IT');
      newLoopIt(Index)
    }
  })
}

// newLoopIt(Index)

// DataParser.resetFirebase()
// DataParser.saveRoutePairs()
// DataParser.saveDBtoFile();

// DataParser.getRoutes();

// DataParser.getRoutesFromAPI();

// DataParser.getStationsByRoute()
// DataParser.getTimetableByFirstStationOnRoute()
DataParser.getTimetableByFirstStationFromFile()
