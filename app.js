'use strict';

var express = require('express')
  , http = require('http')
  , path = require('path')
  , reload = require('reload')
  , bodyParser = require('body-parser')
  , logger = require('morgan')
  , fetch = require('node-fetch')
  , fs = require('fs');

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
var BART = require('./BART.js')
// var r = require('./Responses.js')

const app = express()
const port = 4444

const publicDir = path.join(__dirname, '')

app.set('port', process.env.PORT || port)
app.use(logger('dev'))
app.use(bodyParser.json()) //parses json, multi-part (file), url-encoded

// app.get('/', function(req, res) {
//   res.sendFile(path.join(publicDir, 'index.html'))
// })

app.get('/', function(req, res) {
  console.log('hello');

  res.send('hello world')

  // var obj

  // // Read the file and send to the callback
  // fs.readFile('data/trips.json', handleFile)

  // // Write the callback function
  // function handleFile(err, data) {
  //     if (err) throw err
  //     obj = JSON.parse(data)
  //     // You can now play with your datas

  //     console.log(prettyjson.render(obj))
  //     // DataParser.hello()
  //     res.send(obj)
  // }


  // var host = req.hostname
  // var protocol = req.protocol
  // var url = protocol + '://' + host + ':' + port + path.join('/data/trips.json')
  // console.log(url)
  // res.send(url)
  // fetch(url).then((json) => {
  //   res.send(json.body)
  // }).catch(error => console.log(error))
})


app.get('/journey/*', (req, res) => {
  console.log('hello journey')
  console.log(new URL(req.url))

  res.json({ message: 'hello journey' })
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
  // console.log('before the effin error')
  const pathname = _.takeRight(url.pathname.split('/'), 2)
  // .shift()
  console.log('got dat motherfukin request bitches')
  // console.log(pathname)
  // if(!pathname[0] || !pathname[1]) return

  const filePaths = ['./gtfs/data/stop_times.txt', './gtfs/data/trips.txt']

  const promises = _.map(filePaths, (filePath) => {

    return new Promise((resolve, reject) => {
      
      fs.readFile(filePath, 'utf-8', (err, filedata) => {
        Papa.parse(filedata, {
          complete(results) {
            // console.log(results.data.length)
            const dropped = _(results.data).drop().dropRight().value()
            // console.log(dropped.length)
            // res.json(dropped)
            resolve(dropped)
            // console.log("Finished:", );
          }
        })
      })
    })
  })

  Promise.all( promises )
    .then(data => {

      // console.log( data )
      const [ stops, trips ] = data

      // console.log(stops)
      // console.log(trips)

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
      // save this item here to the cache and return it
      // const end = now()
      // const duration = (start - end).toFixed(3) * -1
      // console.log(`${duration} ms`)
      // console.log(tripObject)

      res.json(tripObject)
      // return tripObject
    })

  // let filePath
  // switch (pathname[1]) {
  //   case 'trips':
  //     filePath = './gtfs/data/trips.txt'
  //     break
  //   case 'stops':
  //     filePath = './gtfs/data/stop_times.txt'
  //     break
  //   default:
  //     res.send('error')
  // }

  // fs.readFile(filePath, 'utf-8', (err, filedata) => {
  //   Papa.parse(filedata, {
  //     complete(results) {
  //       // console.log(results.data.length)
  //       const dropped = _(results.data).drop().dropRight().value()
  //       console.log(dropped.length)
  //       res.json(dropped)
  //       // console.log("Finished:", );
  //     }
  //   })
  // })
})

app.get('/routes/*', (req, res) => {
  console.log('hello routes')
  const filePath = './backend/routes.json'
  console.log(filePath)

  jsonfile.readFile( filePath, (err, data) => {
    res.json(data)
  })

  // fs.readFile(filePath, 'utf-8', (err, filedata) => {
  //   Papa.parse(filedata, {
  //     complete(results) {
  //       // console.log(results.data.length)
  //       // const dropped = _(results.data).drop().dropRight().value()
  //       // console.log(dropped.length)
  //       // res.json(dropped)
  //       // console.log(results.data)
  //       res.json(results.data)
  //       // console.log("Finished:", );
  //     }
  //   })
  // })
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

// DataParser.getTimetableByFirstStationFromFile()

// DataParser.listFilesInDirectory()
// DataParser.saveRouteFilesToFirebase();

// DataParser.saveRouteFilesFromFirebase();
// DataParser.saveStationsToFile()

// DataParser.saveRouteFileToFirebase()
// DataParser.saveLineStationsFileToFirebase()
// DataParser.transformScheduleFile()
// DataParser.getAllNewDataToFile()

// GTFS.getFiles()
//   .then(allData => {
//     let start = now()
    
    

//     // received all data from all files
//     // console.log(allData);
//     let filenames = _.map(allData, item => item.name)
//     let data = _.map(allData, item => item.data)
//     let files = {}
//     _.each(filenames, (filename, index) => {
//       files[filename] = data[index]
//     })
//     console.log(filenames);

//     // NOTE: useful
//     // console.log(files['trips']);
//     // console.log(files['stop_times'][1][1]);
//     // console.log(files['transfers']);
//     // console.log(files['stop_times']);

//     // NOTE: useless
//     // console.log(files['stops']);
//     // console.log(files['frequencies']);
//     // console.log(files['routes']);


    
//     // console.log(files['transfers']);


    
    

//     // let typeOfDay = {}
//     // typeOfDay['WKDY'] = '03/18/2016'
//     // typeOfDay['SAT'] = '03/19/2016'
//     // typeOfDay['SUN'] = '03/12/2016'

//     // let getTimesByStation = function( stationName, dayOfWeek, earliest, latest ) {

//     //   let times = _.filter( files['stop_times'], stop => {
//     //     // let time = moment(`${typeOfDay[dayOfWeek]} ${stop[1]}`, 'MM-DD-YYYY HH:mm:ss')
        
//     //     // if (!time.isValid()) {
//     //     //   console.log('invalid date bro');
//     //     //   let hour = stop[1].split(":")[0]
//     //     //   let minute = stop[1].split(":")[1]
//     //     //   hour = +hour - 24
//     //     //   if (hour === 0) {
//     //     //     let timeString = `00:${minute}:00`
//     //     //     time = moment(`${typeOfDay[dayOfWeek]} ${timeString}`, 'MM-DD-YYYY HH:mm:ss')
//     //     //     let formatedTime = time.format('HH:mm:ss')
//     //     //     console.log(formatedTime);
//     //     //   } else {
//     //     //     let timeString = `0${hour}:${minute}:00`
//     //     //     time = moment(`${typeOfDay[dayOfWeek]} ${timeString}`, 'MM-DD-YYYY HH:mm:ss')
//     //     //     let formatedTime = time.format('HH:mm:ss')
//     //     //     console.log(formatedTime);
//     //     //   }
//     //     // } else {
//     //     //   // console.log(formatedTime);
//     //     // }

//     //     // console.log(stop[1]);
//     //     // console.log(earliest);
//     //     // if ( stop[1] >= earliest && stop[1] <= latest ) {
//     //     //   console.log(stop[1]);
//     //     // }
//     //     // console.log(stop[1] >= earliest && stop[1] <= latest);

//     //     let index = stop[0].length - 3
//     //     let substring = stop[0].substring(index)
//     //     // console.log(substring === 'SAT');
//     //     if ( dayOfWeek !== 'SAT' && dayOfWeek !== 'SUN' ) {
//     //       return ( stop[3] === stationName && stop[1] >= earliest && stop[1] <= latest && substring !== 'SAT' && substring !== 'SUN' ) ? 1 : 0
//     //     } else if ( dayOfWeek === 'SAT' ) {
//     //       return ( stop[3] === stationName && stop[1] >= earliest && stop[1] <= latest && substring === 'SAT' ) ? 1 : 0
//     //     } else if ( dayOfWeek === 'SUN' ) {
//     //       return ( stop[3] === stationName && stop[1] >= earliest && stop[1] <= latest && substring === 'SUN' ) ? 1 : 0
//     //     }

        
//     //   })
//     //   return times
//     // }

//     // let times = getTimesByStation('12TH', 'SUN', '08:00:00', '09:00:00')
//     // // console.log(times);
//     // let timesGroupedByRouteID = _.groupBy(times, stop => {
//     //   return stop[0]
//     // })

//     // // console.log(timesGroupedByRouteID);
//     // let keysLength = Object.keys(timesGroupedByRouteID).length
//     // console.log(keysLength);

//     // console.log('promises fulfilled');

//     return GTFS.getStopsByDay( files, 'WKDY' )
//       .then( schedule => {
//         // console.log(schedule);
//         let end = now();
//         let duration = (start-end).toFixed(3) * -1;
//         console.log(duration + ' ms');
//         return schedule
//       })
//   })
//   .then( schedule => {
//     // console.log(schedule);
//     let min = '15:00:00'
//     let max = '15:30:00'
//     // let origin = 'PITT'
//     // let destination = 'ROCK'

//     // let origin = 'COLS'
//     // let destination = 'MLBR'

//     // let origin = 'FRMT'
//     // let destination = 'MLBR'

//     let origin = 'PITT'
//     let destination = 'SFIA'


//     let day = 'WKDY'

//     let options = {}
//     options['schedule'] = schedule
//     options['min'] = min
//     options['max'] = max
//     options['origin'] = origin
//     options['destination'] = destination
//     options['type'] = 'departure'
//     options['day'] = day

//     GTFS.getJourney( options )
//   })
//   .catch(e => console.log(e))

// r.handleRequest('/journey/COLS/MLBR/departure/0915/WKD')



