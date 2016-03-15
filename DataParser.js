"use strict";

require ('babel-polyfill');

var fetch = require('node-fetch')
var xmltojson = require('xmltojson')
var xmljs = require('libxmljs')
var prettyjson = require('prettyjson')
var _ = require('lodash')
var now = require("performance-now")
var Firebase = require('firebase')
var moment = require('moment')
var jsonfile = require('jsonfile')
var util = require('util')
var uniqBy = require('lodash.uniqby');
var uniqWith = require('lodash.uniqwith');
_.uniqBy = uniqBy;
_.uniqWith = uniqWith;
var fs = require('fs')


var stationsUrl = 'http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V'

var fire = new Firebase('https://transport-app.firebaseio.com/')

console.log('LOADING DATA');
// let end = now();
// let duration = (start-end).toFixed(3);
// console.log("Took "+duration+"ms");
// fire.once('value').then(response => console.log(response.val()))

let mon = '03/07/2016 2:00 AM'
let tue = '03/08/2016 2:00 AM'
let wed = '03/09/2016 2:00 AM'
let thu = '03/10/2016 2:00 AM'
let fri = '03/04/2016 2:00 AM'
let sat = '03/05/2016 2:00 AM'
let sun = '03/06/2016 2:00 AM'

let days = [mon, tue, wed, thu, fri, sat, sun]


exports.saveStations = function() {
  return fetch(stationsUrl).then((response) => {
    return response.text()
  }).then((data) => {

    let start = now();

    let json = xmljs.parseXmlString(data, { noblanks: true })
    let stationChildren = json.root().get('stations').childNodes();
    
    let stationArr = stationChildren.map((station) => {
      // console.log(station.name())
      // console.log(station.attrs())
      // console.log(station.text())
      let stationNodes = station.childNodes();
      let object = {};

      // var i = 0;
      // for ( let node of stationNodes ) {
      //   if( i > 2 ) break;
      //   var name = node.name()
      //   switch( name ) {
      //     case 'name':
      //     case 'abbr':
      //       object[name] = node.text()
      //       // console.log(node.name())
      //       // console.log(node.text())
      //       // console.log('---')
      //       break;
      //   }
      //   i++
      // }

      // _.forEach(stationNodes, (node) => {
      //     // console.log(node.name())
      //   // console.log(node.attrs())
      //   // console.log(node.text()) 
      //   var name = node.name()
      //   switch( name ) {
      //     case 'name':
      //     case 'abbr':
      //       object[name] = node.text()
      //       // console.log(node.name())
      //       // console.log(node.text())
      //       // console.log('---')
      //       break;
      //   }
      //   // return object;
      // })


      stationNodes.forEach((node) => {
        let name = node.name()
        switch( name ) {
          case 'name':
          case 'abbr':
            object[name] = node.text()
            break;
        }
      })
      return object;
    })

    // do some processing that takes time
    let end = now();
    let duration = (start-end).toFixed(3);
    console.log("Took "+duration+"ms");

    return stationArr

  }).then((stations) => {
    let stationsEndPoint = fire.child('stations')

    let obj = {};

    for ( let station of stations ) {
      let abbr = station['abbr'];
      let name = station['name']
      obj[abbr] = {
        abbr: abbr,
        name: name
      }
      // stationsEndPoint.child(abbr).set({
      //   abbr: abbr,
      //   name: name
      // })
    }

    stationsEndPoint.set(obj);

    return stationsEndPoint.once('value')
    // console.log(stations)
  }).catch((error) => console.log(error))
}

// returns a promise
exports.getStations = function() {
  return fire.child('stations').once('value')
}

exports.saveRoutePairs = function() {
  return fire.child('stations').once('value').then((response) => response.val())
  .then((data) => {
    // retrieve array of station abbrevations
    var stations = Object.keys(data);
    return stations;
  }).then((stations) => {
    // build array of item array combination

    let array = stations.map((abbr) => {
      let arr = [abbr];
      arr.push(_.without(stations, abbr))
      return arr
    })

    // console.log(array);  
    return array
  }).then((array) => {
    let allPairs = []
    array.forEach((arr) => {
      let pairs = []
      var origin = arr[0];
      for( let destination of arr[1] ) {
        // console.log(`Traveling from ${origin} to ${destination}`)
        allPairs.push( [origin, destination] )
      }
      // allPairs.push(pairs)
    })
    console.log(allPairs);
    return allPairs;
  })
  .then((pairs) => {
    let urls = pairs.map(pair => {
      return [`pairs/${pair[0]}/${pair[1]}`, false]
    })
    return urls
  })
  .then(urls => {
    let promisses = [];
    urls.forEach((item) => {
      promisses.push(fire.child(item[0]).set(item[1]))
    })
    return Promise.all(promisses)
  })
  .then((allPromises) => {
    return 200
  })
  .catch((e) => console.log(e))
}

// returns a promise
exports.getRoutePairs = function() {
  return fire.child('pairs').once('value')
  .catch((e) => console.log(e))
}

// this is a promise
exports.getPairToParse = function() {
  return new Promise((resolve, reject) => {
    this.getRoutePairs()
    .then((fireResponse) => {
      return fireResponse.val()
    })
    .then((pairsData) => {
      var value = false;

      let first = _.findKey( pairsData, function( item ) {
        return _( item )
          .values()
          .uniq()
          .contains( value );
      });

      let second = _.findKey( pairsData[first], function( item ) {
        return !item;
      });

      let pair = [first, second]
      resolve(pair)
    }).catch((e) => reject(e))
  });
  
}

exports.parseNext = function( dateStr ) {
  this.parseNext(dateStr)
}

exports.getAllPairs = function( dateTM ) {
  return new Promise((resolve, reject) => {
    this.getRoutePairs().then((pairs) => {
      // console.log(pairs.val());
      let allPairsObject = pairs.val()
      let allParisKeys = Object.keys(allPairsObject);

      let allPairsArray = [];

      allParisKeys.forEach( (origin) => {
        let keys = Object.keys(allPairsObject[origin]);
        keys.forEach((destination) => {
          allPairsArray.push([origin, destination])
        })
      })

      allPairsArray ? resolve( allPairsArray ) : reject('empty')
    })
  }); 
}

exports.parseByAllPairs = function() {
  this.getAllPairs().then((allPairsArray) => {
    console.log(allPairsArray);
  })
}

exports.getPair = function(pair) {
  return fire.child(`pairs/${pair[0]}/${pair[1]}`).once('value')
  .catch((e) => {
    console.log(e)
  })
}

exports.updatedParsePair = function( DT, Pair ) {
  let THEPAIRWEREPARSING = Pair
  return new Promise((resolve, reject) => {
    resolve(Pair)
  })
  .then((p) => {

      let fp = p

      // console.log('another parse');
      // time=h:mm+am/pm
      // date=<mm/dd/yyyy>
      let timeString = DT
      let t
      let d
      if(!timeString) {
        t = '0:00am'
        d = 'now'
      } else {
        let momentDate = moment(timeString, 'MM-DD-YYYY hh:mm A')
        let newDate = momentDate.add(1, 'minutes')
        t = momentDate.format('hh:mm a').split(' ')
        t = t.join('')
        // console.log(t);
        d = momentDate.format('MM/DD/YYYY')
        // console.log(d);

      }
      
      let url = `http://api.bart.gov/api/sched.aspx?cmd=depart&orig=${fp[0]}&dest=${fp[1]}&date=${d}&key=MW9S-E7SL-26DU-VV8V&b=4&a=0&l=1&time=${t}`
      // console.log( url );
      return url;
    })
    .then((url) => {
      let furl = url
      return fetch(furl).then((response) => response.text())
        .then((xml) => {
          let fxml = xml
          // console.log(xml);
          // console.log('got xml')
          let root = xmljs.parseXmlString(fxml, { noblanks: true }).root()
          let listOfTrips = root.get('schedule').get('request').childNodes();

          let routeInfoByDeparture = listOfTrips.map((trip) => {

            // console.log(trip.name())
            let tt = trip.attrs()
            var legs = trip.childNodes()
            // console.log(legs.length);

            var schedule = legs.map((leg) => {
              let partInfo = leg.attrs()
              let obj = {}

              partInfo.forEach((info) => {
                let name = info.name();
                // console.log(name)
                // console.log(info.value())
                switch(name) {
                  case 'origin':
                  case 'destination':
                  case 'origTimeMin':
                  case 'origTimeDate':
                  case 'destTimeMin':
                  case 'destTimeDate':
                  case 'line':
                    // console.log(info.value())
                    if ( name === 'line' ) {
                      let num = info.value().split(' ')[1]
                      if ( num.length < 2 ) {
                        num = '0' + num
                      } else num = '' + num
                      obj[name] = num
                      break;
                    }
                    obj[name] = info.value()
                    break;
                }
              })
              return obj
              // console.log(schedule)
            })
            return schedule
          })

          return routeInfoByDeparture

        }).then((routeArray) => {
          // building urls and data we will be saving to db
          let fRouteArr = routeArray

          var departureUrls = fRouteArr.map((trip, index, array) => {
            let type = 'departure'
            let first = _.head(trip)
            let last = _.last(trip)

            let origin = first.origin
            let destination = last.destination

            let dateStr = first.origTimeDate + ' ' + first.origTimeMin
            let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
            let timestamp = momentDate.format('HHmm')
            let day = momentDate.format('ddd').toUpperCase()
            
            let url = `new/journey/${origin}/${destination}/${type}/${day}/${timestamp}`
            
            var arr = []
            arr.push(url);
            arr.push(trip);
            return arr
          })
          // console.log(departureUrls);

          var arrivalUrls = fRouteArr.map((trip) => {
            let type = 'arrival'
            let first = _.head(trip)
            let last = _.last(trip)

            let origin = first.origin
            let destination = last.destination

            // console.log('checking last');
            // console.log(trip);
            // console.log(last);

            let dateStr = last.destTimeDate + ' ' + last.destTimeMin
            let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
            let timestamp = momentDate.format('HHmm')
            let day = momentDate.format('ddd').toUpperCase()
            
            let url = `new/journey/${origin}/${destination}/${type}/${day}/${timestamp}`
            // console.log('logging url')
            // console.log(url);
            
            var arr = []
            arr.push(url);
            arr.push(trip);
            return arr
          })
          // console.log(arrivalUrls);

          let object = {departure: departureUrls, arrival: arrivalUrls}
          return object;

        })
        .then(urlObject => {

          let fUrlObject = urlObject
          // here is important check for what we should be parsing netx
          // if continue parsing or moving to the next pair/day

          // console.log('Logging last item in departures');
          // console.log(_.first(urlObject.departure)[0]);

          console.log('THIS IS CURRENT PAIR WE"RE PARSING AND WERE CHECKING IF ITS DONE YET');
          console.log(THEPAIRWEREPARSING);
          console.log(DT);
          return fire.child(_.first(fUrlObject.departure)[0]).once('value')
          .then(response => response.val())
          .then(data => {
            // console.log(data);
            if ( data === null ) {
              return fUrlObject
            } else {

              return fire.child(`pairs/${THEPAIRWEREPARSING[0]}/${THEPAIRWEREPARSING[1]}`).set(true)
              .catch(e => {
                console.log('YO THIS IS ERROR WHEN GETTING CHILDTREN TO PARSE');
                console.log(e)}
              )
              .then((promise) => {
                console.log('WE HAVE MARKED THE PAIR AS PARSED!');
                console.log(THEPAIRWEREPARSING);
                return fUrlObject
              })

              // let message = 'WE HAVE PARSED THIS ONE ALREADY AND SHOULD PROBABLY PARSE ANOTHER PAIR!'
              // return Promise.reject(message)
            }
          })
        })
        .then((urlData) => {
          // saving all data we got to firebase
          let furlData = urlData

          let promisses = [];

          let departurePromises = furlData.departure.map(array => {
            // console.log(array[0]);
            return fire.child(array[0]).set(array[1])
          })

          let arrivalPromises = furlData.arrival.map(array => {
            // console.log(array[0]);
            return fire.child(array[0]).set(array[1])
          })

          promisses.push( departurePromises )
          promisses.push( arrivalPromises )

          return Promise.all(promisses).then((response) => {
            return furlData
          }).catch((e) => console.log(e))
        }).then((respo) => {
          // console.log('THIS IS LAST THEN');

          let fRespo = respo

          // call this function again with timedate string, that will be picked up at the start of this function
          // console.log(_.last(resp.departure));
          let firstDeparture = _.first(fRespo.departure);
          let firstDepartureItem = firstDeparture[1][0];
          // console.log(firstDeparture);
          let origin = _.first(firstDeparture[1]).origin;
          let dest = _.last(firstDeparture[1]).destination;

          let currPair =  [origin, dest]
          // console.log(currPair);

          let dateStr = firstDepartureItem.origTimeDate + ' ' + firstDepartureItem.origTimeMin
          // let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
          // console.log(dateStr);

          // console.log("CURRENT PAIR!!!");
          // console.log("CURRENT PAIR!!!");
          // console.log("CURRENT PAIR!!!");
          // console.log("CURRENT PAIR!!!");
          // console.log("CURRENT PAIR!!!");
          // console.log("CURRENT PAIR!!!");
          // console.log(currPair);

          return this.getPair(currPair).then(rr => rr.val())
          .then((bootlean) => {

            let bl = bootlean

            // console.log('BOOOTLEAN');
            // console.log('BOOOTLEAN');
            // console.log('BOOOTLEAN');
            // console.log('BOOOTLEAN');
            // console.log('BOOOTLEAN');
            // console.log('BOOOTLEAN');
            // console.log('BOOOTLEAN');
            // console.log('BOOOTLEAN');
            // console.log(bl);

            if(!bl) {
              let result = {date: dateStr, pair: currPair}
              return Promise.resolve(result)
            } else return Promise.resolve(200)

          }).catch((e) => console.log(e))

          // return this.getPairToParse().then((pair) => {
          //   // return new Promise((resolve, reject) => {
          //   //     return resolve(200)
          //   //   });
          //   console.log(pair);
          //   console.log( pair[0] === currPair[0] && pair[1] === currPair[1] );

          //   if (!pair[0]) {
          //     // return sucess
              
          //     return Promise.resolve(200)
          //   } else {
          //     console.log('continue parsing');
          //     console.log(pair[0] !== currPair[0] || pair[1] !== currPair[1]);
          //     if ( pair[0] !== currPair[0] || pair[1] !== currPair[1] ) {
          //       let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A');
          //       let day = momentDate.day() - 1;
          //       console.log(day);
          //       console.log(days[day]);
          //       console.log('NEW PARI FROM BEGINNING');
          //       console.log('NEW PARI FROM BEGINNING');
          //       console.log('NEW PARI FROM BEGINNING');
          //       console.log('NEW PARI FROM BEGINNING');
          //       console.log('NEW PARI FROM BEGINNING');
          //       console.log('NEW PARI FROM BEGINNING');
          //       return Promise.resolve(days[day])
          //     }
          //     // this.parseNext(dateStr)
          //     return Promise.resolve(dateStr)
          //   }
          // })
          
          // let timeDate =
          
          // this.parsePair( dateStr ) 
          
          // console.log(resp);
        }).catch((e) => Promise.reject(e))
    }).catch(er => Promise.reject([DT, Pair]))
  
}

exports.parseSinglePair = function( dateTime ) {
  return this.getPairToParse()
  .then((pair) => {

    console.log('another parse');
    // time=h:mm+am/pm
    // date=<mm/dd/yyyy>
    let timeString = dateTime
    let t
    let d
    if(!timeString) {
      t = '0:00am'
      d = 'now'
    } else {
      let momentDate = moment(timeString, 'MM-DD-YYYY hh:mm A')
      let newDate = momentDate.add(1, 'minutes')
      t = momentDate.format('hh:mm a').split(' ')
      t = t.join('')
      console.log(d);
      d = momentDate.format('MM/DD/YYYY')
      console.log(t);

    }
    
    let url = `http://api.bart.gov/api/sched.aspx?cmd=depart&orig=${pair[0]}&dest=${pair[1]}&date=${d}&key=MW9S-E7SL-26DU-VV8V&b=4&a=0&l=1&time=${t}`
    console.log( url );
    return url;
  })
  .then((url) => {
    return fetch(url).then((response) => response.text())
      .then((xml) => {
        // console.log(xml);
        // console.log('got xml')
        let root = xmljs.parseXmlString(xml, { noblanks: true }).root()
        let listOfTrips = root.get('schedule').get('request').childNodes();

        let routeInfoByDeparture = listOfTrips.map((trip) => {

          // console.log(trip.name())
          let tt = trip.attrs()
          var legs = trip.childNodes()
          // console.log(legs.length);

          var schedule = legs.map((leg) => {
            let partInfo = leg.attrs()
            let obj = {}

            partInfo.forEach((info) => {
              let name = info.name();
              // console.log(name)
              // console.log(info.value())
              switch(name) {
                case 'origin':
                case 'destination':
                case 'origTimeMin':
                case 'origTimeDate':
                case 'destTimeMin':
                case 'destTimeDate':
                case 'line':
                  // console.log(info.value())
                  if ( name === 'line' ) {
                    let num = info.value().split(' ')[1]
                    if ( num.length < 2 ) {
                      num = '0' + num
                    } else num = '' + num
                    obj[name] = num
                    break;
                  }
                  obj[name] = info.value()
                  break;
              }
            })
            return obj
            // console.log(schedule)
          })
          return schedule
        })

        return routeInfoByDeparture

      }).then((routeArray) => {
        // building urls and data we will be saving to db

        var departureUrls = routeArray.map((trip, index, array) => {
          let type = 'departure'
          let first = _.head(trip)
          let last = _.last(trip)

          let origin = first.origin
          let destination = last.destination

          let dateStr = first.origTimeDate + ' ' + first.origTimeMin
          let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
          let timestamp = momentDate.format('HHmm')
          let day = momentDate.format('ddd').toUpperCase()
          
          let url = `journey/${origin}/${destination}/${type}/${day}/${timestamp}`
          
          var arr = []
          arr.push(url);
          arr.push(trip);
          return arr
        })
        // console.log(departureUrls);

        var arrivalUrls = routeArray.map((trip) => {
          let type = 'arrival'
          let first = _.head(trip)
          let last = _.last(trip)

          let origin = first.origin
          let destination = last.destination

          // console.log('checking last');
          // console.log(trip);
          // console.log(last);

          let dateStr = last.destTimeDate + ' ' + last.destTimeMin
          let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
          let timestamp = momentDate.format('HHmm')
          let day = momentDate.format('ddd').toUpperCase()
          
          let url = `journey/${origin}/${destination}/${type}/${day}/${timestamp}`
          // console.log('logging url')
          // console.log(url);
          
          var arr = []
          arr.push(url);
          arr.push(trip);
          return arr
        })
        // console.log(arrivalUrls);

        let object = {departure: departureUrls, arrival: arrivalUrls}
        return object;

      })
      .then(urlObject => {

        // here is important check for what we should be parsing netx
        // if continue parsing or moving to the next pair/day

        // console.log('Logging last item in departures');
        // console.log(_.first(urlObject.departure)[0]);
        return fire.child(_.first(urlObject.departure)[0]).once('value')
        .then(response => response.val())
        .then(data => {
          // console.log(data);
          if ( data === null ) {
            return urlObject
          } else {

            return this.getPairToParse()
            .then((currentPair) => {
              return fire.child(`pairs/${currentPair[0]}/${currentPair[1]}`).set(true)
            })
            .then((promise) => {
              return urlObject
            })

            // let message = 'WE HAVE PARSED THIS ONE ALREADY AND SHOULD PROBABLY PARSE ANOTHER PAIR!'
            // return Promise.reject(message)
          }
        })
      })
      .then((urlData) => {
        // saving all data we got to firebase
        let origData = urlData

        let promisses = [];

        let departurePromises = urlData.departure.map(array => {
          // console.log(array[0]);
          return fire.child(array[0]).set(array[1])
        })

        let arrivalPromises = urlData.arrival.map(array => {
          // console.log(array[0]);
          return fire.child(array[0]).set(array[1])
        })

        promisses.push( departurePromises )
        promisses.push( arrivalPromises )

        return Promise.all(promisses).then((response) => {
          return origData
        }).catch((e) => console.log(e))
      }).then((resp) => {
        // console.log('THIS IS LAST THEN');

        // call this function again with timedate string, that will be picked up at the start of this function
        // console.log(_.last(resp.departure));
        let firstDeparture = _.first(resp.departure);
        let firstDepartureItem = firstDeparture[1][0];
        // console.log(firstDeparture);
        let origin = _.first(firstDeparture[1]).origin;
        let dest = _.last(firstDeparture[1]).destination;

        let currPair =  [origin, dest]
        console.log(currPair);

        let dateStr = firstDepartureItem.origTimeDate + ' ' + firstDepartureItem.origTimeMin
        // let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
        // console.log(dateStr);

        return this.getPairToParse().then((pair) => {
          // return new Promise((resolve, reject) => {
          //     return resolve(200)
          //   });
          console.log(pair);
          console.log( pair[0] === currPair[0] && pair[1] === currPair[1] );

          if (!pair[0]) {
            // return sucess
            
            return Promise.resolve(200)
          } else {
            console.log('continue parsing');
            console.log(pair[0] !== currPair[0] || pair[1] !== currPair[1]);
            if ( pair[0] !== currPair[0] || pair[1] !== currPair[1] ) {
              let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A');
              let day = momentDate.day() - 1;
              console.log(day);
              console.log(days[day]);
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              return Promise.resolve(days[day])
            }
            // this.parseNext(dateStr)
            return Promise.resolve(dateStr)
          }
        })
        
        // let timeDate =
        
        // this.parsePair( dateStr ) 
        
        // console.log(resp);
      }).catch((e) => console.log(e))
  })
}

exports.parsePair = function( dateTime ) {
  return this.getPairToParse()
  .then((pair) => {

    console.log('another parse');
    // time=h:mm+am/pm
    // date=<mm/dd/yyyy>
    let timeString = dateTime
    let t
    let d
    if(!timeString) {
      t = '0:00am'
      d = 'now'
    } else {
      let momentDate = moment(timeString, 'MM-DD-YYYY hh:mm A')
      let newDate = momentDate.add(1, 'minutes')
      t = momentDate.format('hh:mm a').split(' ')
      t = t.join('')
      console.log(d);
      d = momentDate.format('MM/DD/YYYY')
      console.log(t);

    }
    
    let url = `http://api.bart.gov/api/sched.aspx?cmd=depart&orig=${pair[0]}&dest=${pair[1]}&date=${d}&key=MW9S-E7SL-26DU-VV8V&b=4&a=0&l=1&time=${t}`
    console.log( url );
    return url;
  })
  .then((url) => {
    return fetch(url).then((response) => response.text())
      .then((xml) => {
        // console.log(xml);
        // console.log('got xml')
        let root = xmljs.parseXmlString(xml, { noblanks: true }).root()
        let listOfTrips = root.get('schedule').get('request').childNodes();

        let routeInfoByDeparture = listOfTrips.map((trip) => {

          // console.log(trip.name())
          let tt = trip.attrs()
          var legs = trip.childNodes()
          // console.log(legs.length);

          var schedule = legs.map((leg) => {
            let partInfo = leg.attrs()
            let obj = {}

            partInfo.forEach((info) => {
              let name = info.name();
              // console.log(name)
              // console.log(info.value())
              switch(name) {
                case 'origin':
                case 'destination':
                case 'origTimeMin':
                case 'origTimeDate':
                case 'destTimeMin':
                case 'destTimeDate':
                case 'line':
                  // console.log(info.value())
                  if ( name === 'line' ) {
                    let num = info.value().split(' ')[1]
                    if ( num.length < 2 ) {
                      num = '0' + num
                    } else num = '' + num
                    obj[name] = num
                    break;
                  }
                  obj[name] = info.value()
                  break;
              }
            })
            return obj
            // console.log(schedule)
          })
          return schedule
        })

        return routeInfoByDeparture

      }).then((routeArray) => {
        // building urls and data we will be saving to db

        var departureUrls = routeArray.map((trip, index, array) => {
          let type = 'departure'
          let first = _.head(trip)
          let last = _.last(trip)

          let origin = first.origin
          let destination = last.destination

          let dateStr = first.origTimeDate + ' ' + first.origTimeMin
          let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
          let timestamp = momentDate.format('HHmm')
          let day = momentDate.format('ddd').toUpperCase()
          
          let url = `journey/${origin}/${destination}/${type}/${day}/${timestamp}`
          
          var arr = []
          arr.push(url);
          arr.push(trip);
          return arr
        })
        // console.log(departureUrls);

        var arrivalUrls = routeArray.map((trip) => {
          let type = 'arrival'
          let first = _.head(trip)
          let last = _.last(trip)

          let origin = first.origin
          let destination = last.destination

          // console.log('checking last');
          // console.log(trip);
          // console.log(last);

          let dateStr = last.destTimeDate + ' ' + last.destTimeMin
          let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
          let timestamp = momentDate.format('HHmm')
          let day = momentDate.format('ddd').toUpperCase()
          
          let url = `journey/${origin}/${destination}/${type}/${day}/${timestamp}`
          // console.log('logging url')
          // console.log(url);
          
          var arr = []
          arr.push(url);
          arr.push(trip);
          return arr
        })
        // console.log(arrivalUrls);

        let object = {departure: departureUrls, arrival: arrivalUrls}
        return object;

      })
      .then(urlObject => {

        // here is important check for what we should be parsing netx
        // if continue parsing or moving to the next pair/day

        // console.log('Logging last item in departures');
        // console.log(_.first(urlObject.departure)[0]);
        return fire.child(_.first(urlObject.departure)[0]).once('value')
        .then(response => response.val())
        .then(data => {
          // console.log(data);
          if ( data === null ) {
            return urlObject
          } else {

            return this.getPairToParse()
            .then((currentPair) => {
              return fire.child(`pairs/${currentPair[0]}/${currentPair[1]}`).set(true)
            })
            .then((promise) => {
              return urlObject
            })

            // let message = 'WE HAVE PARSED THIS ONE ALREADY AND SHOULD PROBABLY PARSE ANOTHER PAIR!'
            // return Promise.reject(message)
          }
        })
      })
      .then((urlData) => {
        // saving all data we got to firebase
        let origData = urlData

        let promisses = [];

        let departurePromises = urlData.departure.map(array => {
          // console.log(array[0]);
          return fire.child(array[0]).set(array[1])
        })

        let arrivalPromises = urlData.arrival.map(array => {
          // console.log(array[0]);
          return fire.child(array[0]).set(array[1])
        })

        promisses.push( departurePromises )
        promisses.push( arrivalPromises )

        return Promise.all(promisses).then((response) => {
          return origData
        }).catch((e) => console.log(e))
      }).then((resp) => {
        // console.log('THIS IS LAST THEN');

        // call this function again with timedate string, that will be picked up at the start of this function
        // console.log(_.last(resp.departure));
        let firstDeparture = _.first(resp.departure);
        let firstDepartureItem = firstDeparture[1][0];
        // console.log(firstDeparture);
        let origin = _.first(firstDeparture[1]).origin;
        let dest = _.last(firstDeparture[1]).destination;

        let currPair =  [origin, dest]
        console.log(currPair);

        let dateStr = firstDepartureItem.origTimeDate + ' ' + firstDepartureItem.origTimeMin
        // let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A')
        // console.log(dateStr);

        return this.getPairToParse().then((pair) => {
          // return new Promise((resolve, reject) => {
          //     return resolve(200)
          //   });
          console.log(pair);
          console.log( pair[0] === currPair[0] && pair[1] === currPair[1] );

          if (!pair[0]) {
            // return sucess
            
            return Promise.resolve(200)
          } else {
            console.log('continue parsing');
            console.log(pair[0] !== currPair[0] || pair[1] !== currPair[1]);
            if ( pair[0] !== currPair[0] || pair[1] !== currPair[1] ) {
              let momentDate = moment(dateStr, 'MM-DD-YYYY hh:mm A');
              let day = momentDate.day() - 1;
              console.log(day);
              console.log(days[day]);
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              console.log('NEW PARI FROM BEGINNING');
              return Promise.resolve(days[day])
            }
            // this.parseNext(dateStr)
            return Promise.resolve(dateStr)
          }
        })
        
        // let timeDate =
        
        // this.parsePair( dateStr ) 
        
        // console.log(resp);
      }).catch((e) => console.log(e))
  })
}

exports.resetFirebase = function() {
  fire.child('new').set(null)
}

exports.saveDBtoFile = function() {
  console.log('saving data to file');
  this.getAllPairs().then((pairs) => {
    let p = pairs
    // console.log(p);
    let getPair = function() {
      // console.log(p);
      let pair = p[0];
      console.log(pair);
      // `new/journey/${pair[0]}/${pair[1]}/departure`
      fire.child(`new/journey/${pair[0]}/${pair[1]}/departure`).once('value').then((response) => response.val())
      .then((data) => {
        let d = data
        let file = `./D/${pair[0]}-${pair[1]}.json`

        console.log(file);

        jsonfile.writeFile(file, data, {spaces: 2}, function(err) {
          console.error(err)
        })
      })
      .then(() => {
        p.shift();
        console.log(p);
        if( p.length !== 0 ) {
          getPair()
        }
      }).catch((e) => console.log(e))
    }
    
    getPair();
    
  })
  // fire.child('pairs').once('value').then((response) => {
    
  //   // let data = response.val();
  //   // let file = './data.json'

  //   // jsonfile.writeFile(file, data, {spaces: 2}, function(err) {
  //   //   console.error(err)
  //   // })
  // }).catch((e) => console.log(e))
  // fire.child('new/journey/').once('value').then((response) => {
  //   let data = response.val();
  //   let file = './data.json'

  //   jsonfile.writeFile(file, data, {spaces: 2}, function(err) {
  //     console.error(err)
  //   })
  // }).catch((e) => console.log(e))
}

exports.getRoutesAndSaveToFile = function() {
  this.getAllPairs().then((pairs) => {
    let days = ['FRI', 'SAT', 'SUN']
    let firstPair = pairs[0]
    // let file = `./D/CIVC-NBRK.json`
    // let file = `./D/${firstPair[0]}-${firstPair[1]}.json`

    console.log(days);

    _.forEach(pairs, (pair) => {


      let file = `./D/${pair[0]}-${pair[1]}.json`
      let promisesForRoute = _.map(days, (d) => {
        let day = d
        return new Promise((resolve, reject) => {
          console.log(d);
          jsonfile.readFile(file, function(err, obj) {
            if (err) {
              console.log(err);
              reject('file read error')
            } else {
              // console.log(obj);
              let singleDay = obj[day]
              resolve(singleDay)
            }
          })
        }).then((singleDay) => {
          let timeKeys = Object.keys(singleDay)
          // console.log(friday);
          // console.log(timeKeys);

          let routeLines = timeKeys.map((key) => {
            // console.log(friday[key]);
            let routes = singleDay[key];
            // console.log(route);
            return routes.map((route) => {
              // console.log(route);
              return {
                origin: route.origin,
                line: route.line,
                destination: route.destination
              }
            })
          });

          return routeLines
        })
        .then(lines => {

          let uniqueRoutes = _.uniqWith(lines, _.isEqual)

          return uniqueRoutes;
        })
        .then((uniqueRoutes) => {
          
          console.log(pair);
          console.log(day);
          console.log(uniqueRoutes);

          let obj = {};
          obj[day] = uniqueRoutes

          return obj

        })
      })

      Promise.all(promisesForRoute).then((data) => {
        console.log("PRINTING DATA");
        console.log(pair);
        console.log(data);
        console.log('done');
        let file = `./data/${pair[0]}-${pair[1]}.json`

        let dataObj = {}
        _.forEach(data, (day) => {
          let dayKey = Object.keys(day)
          let sorted = _.sortBy(day[dayKey], (thing) => {
            return thing.length
          })
          dataObj[dayKey] = sorted
        })
        console.log(dataObj);

        jsonfile.writeFile(file, dataObj, {spaces: 2}, function(err) {
          if (err) {
            console.log(err);
          }
        })
      })

    })

  })

}

exports.getRoutesFromAPI = function() {

  let url = 'http://api.bart.gov/api/route.aspx?cmd=routes&key=MW9S-E7SL-26DU-VV8V'

  fetch(url).then((data) => data.text()).then((data) => {

    let json = xmljs.parseXmlString(data, { noblanks: true })
    // console.log(json.root().get('routes').childNodes());
    let routesNode = json.root().get('routes').childNodes();
    // console.log(routeNodes.length);
    
    let routes = routesNode.map((route) => {
      // console.log(route.name());

      let routeNodes = route.childNodes();
      // console.log(routeNodes);
      let object = {};

      routeNodes.forEach((node) => {
        let name = node.name()
        switch( name ) {
          case 'number':
            let text = node.text();
            // if ( text.length === 1 ) {
            //   text = '0' + text
            // }
            object[name] = parseInt(text)
            break;
        }
      })
      return object;
    })
    // console.log(typeof routes);
    // console.log(_.isArray(routes));
    // console.log( ); 
    routes = _.sortBy(routes, 'number') 
    return routes
  }).then((routesObject) => {

    routesObject = _.map(routesObject, (a) => {
      let number = '' + a.number
      if ( number.length === 1 ) {
        number = 0 + number
      }
      a.number = number
      return number
    })

    return routesObject
  }).then((newRouteObject) => {

    let obj = {}
    obj.lines = newRouteObject
    console.log(newRouteObject);
    console.log(obj);

    let file = './newData/lines.json'
    jsonfile.writeFile(file, obj, {spaces: 2}, function(err) {
      if(err) {
        console.log(err);
      }
    })
  })
}

exports.getStationsByRoute = function() {

  let file = './newData/lines.json'
  let lines = new Promise((resolve, reject) => {
    jsonfile.readFile(file, function(err, obj) {
      resolve(obj)
    })
  });

  lines.then(data => {

    let whatever = _.map(data.lines, (l) => {

      let line = parseInt(l)

      let url = `http://api.bart.gov/api/route.aspx?cmd=routeinfo&route=${line}&key=MW9S-E7SL-26DU-VV8V`
      console.log(url);
      return fetch(url)
      .then((xml) => xml.text())
      .then((xmlText) => {

        // console.log(xmlText)
        let json = xmljs.parseXmlString(xmlText, { noblanks: true })
        // console.log(json.root().get('routes').childNodes());
        let stationNodes = json.root().get('routes').get('route').get('config').childNodes();
        // console.log(routeNodes.length);
        
        let stations = stationNodes.map((stationNode) => {
          // console.log(route.name());

          return stationNode.text()
          
        })

        return [l, stations]

      })
      .catch((e) => console.log(e))

    })

    Promise.all(whatever).then(fulfilled => {
      let object = {}
      fulfilled.forEach(line => {
        object[line[0]] = line[1]
      })

      let file = './newData/line-stations.json'

      jsonfile.writeFile(file, object, {spaces: 2}, (err) => {
        if (err) {
          console.log(err);
        }
      })
    })

  })

}

exports.getTimetableByFirstStationOnRoute = function() {

  let file = './newData/line-stations.json'
  let lines = new Promise((resolve, reject) => {
    jsonfile.readFile(file, function(err, obj) {
      resolve(obj)
    })
  });

  lines.then(data => {

    // console.log(data);

    // console.log(Object.keys(data));
    let keys = Object.keys(data)

    let firstStations = _.map(keys, (key) => {

      return [key, data[key][0] ]

    })

    let onlyStations = _.map(firstStations, (pair) => {
      return pair[1]
    })
    // console.log(firstStations);



    let promises = _.map(firstStations, (stationPairs) => {


      

      let url = `http://api.bart.gov/api/sched.aspx?cmd=stnsched&orig=${stationPairs[1]}&key=MW9S-E7SL-26DU-VV8V`

      // console.log(stationPairs[1]);
      // console.log(stationPairs[0]);
      // console.log(url);

      // console.log('-------');

      return fetch(url)
      .then(response => response.text())
      .then((xmlText) => {
        let json = xmljs.parseXmlString(xmlText, { noblanks: true })
        // console.log(json.root().get('routes').childNodes());
        let stationNodes = json.root().get('station').childNodes();
        // console.log(routeNodes.length);
        stationNodes = _.drop(stationNodes, 2)

        // console.log(stationNodes);

        // console.log(stationPairs[1]);
        // console.log(stationPairs[0]);
        // console.log(url);
        
        let routeArray = []

        let stations = stationNodes.forEach((stationNode) => {
          // console.log(route.name());
          // return stationNode.attrs()
          let nodeAttrs = stationNode.attrs()
          // console.log(nodeAttrs);
          
          let arr = []
           // let object = {}
          _.forEach(nodeAttrs, (attr, index) => {
            let name = attr.name()
            // console.log(attr.name());
            switch (name) {
              case 'line':
                arr.push( parseInt(attr.value().split(' ')[1]) )
                break;
              case 'origTime':
                // if ( nodeAttrs.value())
                // console.log(firstStations[1]);return
                arr.push( attr.value() )
                // let routeNumber = parseInt(attr.value().split(' ')[1])
                // // console.log(routeNumber);
                // if ( routeNumber === 12 ) {
                //   console.log(`got route 12 at ${index} index`);

                //   // console.log(routeNumber);
                // }
                // // console.log('ROUTE ' + parseInt(attr.value()));
                // return 'ROUTE ' + parseInt(attr.value())
                break;
            }

          })

          // console.log(arr);
          routeArray.push( arr )
          // return arr
          // console.log(arr);

          // switch (nodeAttrs.name) {
          //   case 'line':
          //     // if ( nodeAttrs.value())
          //     console.log(nodeAttrs.value());
          //     break;
          // }
          // return stationNode.name()
          
        })

        // console.log(routeArray);
        // console.log(stationPairs[0]);

        let filteredArray = _.filter(routeArray, function(item) {
          // console.log(item[0]);
          if ( item[0] === parseInt(stationPairs[0]) ) return 1
        })

        // console.log(filteredArray);

        let finalObject = {}
        finalObject[stationPairs[1]] = filteredArray

        console.log( stationPairs[1] === 'COLS' );

        if ( stationPairs[1] === 'COLS' ) {
          console.log(routeArray);
        }

        // console.log(finalObject);
        // console.log(stations);
        // console.log(_.flatten(stations));
        // console.log(routeArray);
        // console.log(stations);
        // return [l, stations]
      })
      .catch((e) => console.log(e))

    })

    

    Promise.all(promises).then((fulfilled) => {
      console.log(fulfilled);
    })

    // let whatever = _.map(data.lines, (l) => {

    //   let line = parseInt(l)

    //   let url = `http://api.bart.gov/api/route.aspx?cmd=routeinfo&route=${line}&key=MW9S-E7SL-26DU-VV8V`
    //   console.log(url);
    //   return fetch(url)
    //   .then((xml) => xml.text())
    //   .then((xmlText) => {

    //     // console.log(xmlText)
    //     let json = xmljs.parseXmlString(xmlText, { noblanks: true })
    //     // console.log(json.root().get('routes').childNodes());
    //     let stationNodes = json.root().get('routes').get('route').get('config').childNodes();
    //     // console.log(routeNodes.length);
        
    //     let stations = stationNodes.map((stationNode) => {
    //       // console.log(route.name());

    //       return stationNode.text()
          
    //     })

    //     return [l, stations]

    //   })
    //   .catch((e) => console.log(e))

    // })

    // Promise.all(whatever).then(fulfilled => {
    //   let object = {}
    //   fulfilled.forEach(line => {
    //     object[line[0]] = line[1]
    //   })

    //   let file = './newData/line-stations.json'

    //   jsonfile.writeFile(file, object, {spaces: 2}, (err) => {
    //     if (err) {
    //       console.log(err);
    //     }
    //   })
    // })

  })

}

exports.getTimetableByFirstStationFromFile = function() {

  let file = './newData/line-stations.json'

  file = new Promise((resolve, reject) => {
    jsonfile.readFile( file, function(err, object) {
      if (err) {
        console.log(err);
        reject(err)
      } else {
        resolve(object)
      }
    })
  });

  file.then((f) => {
    // console.log(f);

    let keys = Object.keys(f)
    console.log(keys);
    // let route = {}
    // route[keys[0]] = f[keys[0]]
    console.log(keys.length);
    let allRoutePromises = _.map(keys, (key) => {

      return new Promise((resolve, reject) => {
        // console.log(keys);
        // console.log(key);
        // console.log(keys[key]);
        let route = [key, f[key]]
        // console.log(route);
        resolve(route)
      })
      .then((route) => {
        // console.log('route');
        console.log( route[0] );

        // let keys = 
        // let pair = route[]
        let pair = [route[1][0], route[1][1]]
        // console.log(pair);

        return new Promise((resolve, reject) => {
          let file = `./D/${pair[0]}-${pair[1]}.json`
          // console.log(file);

          jsonfile.readFile( file, (err, data) => {
            if (err) reject()
            resolve([route, data])
          })
          // console.log(file);
        })
        .then(data => {
          let dayKeys = Object.keys(data[1])

          // let monday = data[1]['MON']
          // console.log(monday);
          dayKeys = _.filter(dayKeys, (key) => {
            switch(key) {
              case 'MON':
              case 'SAT':
              case 'SUN':
                return 1;
                break;
            }
          })

          let dayPromises = _.map(dayKeys, (key) => {
            // console.log(data[1][key]);

            return new Promise((resolve, reject) => {
                
              // console.log('KEY');
              // console.log(key);
              // console.log(data[0][0]);
              // console.log(data[0]);

              let day = data[1][key]
              let mondayKeys = Object.keys(day);
              let requiredLineArray = _.filter(mondayKeys, (time) => {
                // console.log(day[time][0].line);
                // console.log(data[0][0]);
                if ( day[time][0].line === data[0][0] ) return true
              })

              // console.log(requiredLineArray.length);
              let sorted = requiredLineArray.sort()
              let dateTimeStrings = _.map(sorted, (key) => {
                return [`${day[key][0].origTimeDate} ${day[key][0].origTimeMin}`, parseInt(key)]
              })

              
              if ( sorted.length === 0 ) {
                console.log(key);
                console.log(data[0][0]);
                console.log('sorted length');
                console.log(sorted.length);
                resolve( {
                day: key,
                line: data[0]
              } )
              }
              

              // console.log(dateTimeStrings);
              resolve( {
                day: key,
                timeTable: dateTimeStrings,
                line: data[0]
              } )
              // return 

            })
            .then(sortedTimetable => {
              // console.log(sortedTimetable);
              if ( !sortedTimetable.timeTable ) return sortedTimetable
              // console.log(sortedTimetable.timeTable.length);

              let array = sortedTimetable.timeTable
              let arrLength = sortedTimetable.timeTable.length
              let firstDepartureIndex

              for( let index in array ) {
                index = +index 

                if ( (index + 1) !== arrLength ) {
                  // console.log('hello');
                  let startTime = moment( array[index][0], 'MM-DD-YYYY hh:mm A')
                  let end = moment( array[index + 1][0], 'MM-DD-YYYY hh:mm A')

                  let duration = moment.duration(end.diff(startTime));
                  let minutes = duration.asMinutes();
                  let timeDiff = minutes;
                  // let timeDiff = time - array[0]

                  // console.log(timeDiff);


                  if ( timeDiff < 60 ) {
                    firstDepartureIndex = index
                    // console.log(firstDepartureIndex);
                    break;
                  }
                }
              }

              let firstDeparture = array[firstDepartureIndex][0]

              sortedTimetable.firstDeparture = firstDeparture
              return sortedTimetable

            })
            .then(data => {

              if (!data.timeTable) return data;

              // console.log('PRINTING PRINTING');
              // console.log(data);

              let stations = data.line[1];
              let endOfArray = stations.length - 1
              // console.log(stations);
              let pairs = []

              _.forEach(stations, (station, index, array) => {
                if (index !== endOfArray) {
                  pairs.push([station, array[index + 1]])
                }
              })

              // console.log(pairs);

              let urls = _.map(pairs, (pair) => {
                // the urls are missing time and date that should be appended at the time of parsing ---> &time=2:00am&date=03/04/2016
                let url = `http://api.bart.gov/api/sched.aspx?cmd=depart&orig=${pair[0]}&dest=${pair[1]}&key=MW9S-E7SL-26DU-VV8V&b=0&a=1&l=0`
                return url
              })

              // console.log(urls);

              let xmls = []
              // console.log(urls);

              let index = 0;

              let times = []

              // console.log(data.firstDeparture);
              return new Promise((resolve, reject) => {
                
                let recursiveCall = function( timeString ) {

                  // console.log(index !== urls.length);

                  if ( index !== urls.length ) {
                    let momentDate = moment(timeString, 'MM-DD-YYYY hh:mm A')
                    let date = momentDate.format('MM/DD/YYYY')
                    let time = momentDate.format('hh:mma')
                    let url = `${urls[index]}&time=${time}&date=${date}`

                    index++

                    // console.log(url);

                    fetch( url ).then((response) => response.text())
                    .then((xml) => {
                      // console.log(xml);

                      let json = xmljs.parseXmlString(xml, { noblanks: true })
                      // console.log(json.root().get('routes').childNodes());
                      let routeAttrs = json.root().get('schedule').get('request').get('trip').attrs()

                      // console.log(routeAttrs);
                      // let times = []
                      let obj = {}

                      _.forEach(routeAttrs, (attr) => {
                        // console.log(attr.name());
                        
                        switch( attr.name() ) {
                          // case 'origTimeMin':
                          case 'destTimeMin':
                          case 'destTimeDate':

                            // console.log(attr.value());
                            // console.log([attr.value()]);
                            obj[attr.name()] = attr.value()
                            // times.push(obj)
                            break
                        }
                        
                        // console.log(attr.value());
                      })

                      // console.log(obj);
                      let newTimeString = `${obj.destTimeDate} ${obj.destTimeMin}`
                      times.push(newTimeString)
                      // console.log(times);
                      
                      // console.log(index === urls.length);

                      if (index === urls.length) {
                        resolve()
                      }

                      let rand = Math.round(Math.random() * 3000);
                      setTimeout(function() {
                        recursiveCall(newTimeString)
                      }, 0)
                      // recursiveCall(newTimeString)
                      // console.log(newTimeString);
                      // console.log(times);

                    }).catch(e => console.log('some sort of error when fetching ', e))
                    

                  }

                }

                times.push(data.firstDeparture)
                let rand = Math.round(Math.random() * 10000);
                setTimeout(function() {
                  recursiveCall(data.firstDeparture)
                }, rand)
                

              }).then(() => {
                // console.log(data);
                // console.log(times);
                if (!data.timeTable ) return data;
                // console.log(times.length === data.line[1].length);

                let arrayOfStationsWithTime = {}

                _.forEach(data.line[1], (lineID, index) => {
                  // console.log(lineID);
                  // let obj = {}
                  arrayOfStationsWithTime[lineID] = [times[index]]
                  // return obj
                })
                let key = data.line[1][0];
                arrayOfStationsWithTime[key].push(data.timeTable)
                // console.log(arrayOfStationsWithTime);

                data.finalObject = {}
                data.finalObject[data.line[0]] = arrayOfStationsWithTime
                // console.log(_.flatten(data.timeTable));

                // console.log(data);
                return data

              })

              // promise

            }).then(data => {

              if (!data.timeTable ) return data;

              let day = {}
              day[data.day] = data.finalObject
              // console.log(day);
              return day;
              // console.log(data.finalObject);
              // console.log('just printing data');
            })


          })

          // console.log(dayPromises);

          console.log(dayPromises.length);
          return Promise.all(dayPromises).catch((e) => {
            console.log('my error here');
            console.log(e)
          })

          // return dateTimeStrings
        })
        .then(allDataFromPromises => {
          // console.log(allDataFromPromises);
          // console.log('got it');
          let routeObject = {}
          console.log(allDataFromPromises.length);

          // let keys = Object.keys(allDataFromPromises)
          // console.log(keys);
          _.forEach(allDataFromPromises, (day, index) => {
            let key = Object.keys(day)[0];
            let route = Object.keys(day[key])[0]
            if ( !routeObject[route] ) {
              routeObject[route] = {}
            }
            
            routeObject[route][key] = day[key][route]
            
          })

          // console.log('printing route object');
          console.log(routeObject);
          console.log('done');
          return Promise.resolve(routeObject)
        })

      }).catch((error) => console.log(error))

    })

    
    // console.log(route);
    // console.log('allRoutePromises');
    // console.log(allRoutePromises);
    return Promise.all(allRoutePromises).catch((e) => {
      console.log('my error error here');
      console.log(e)
    })

  }).then((allRoutePromisesData) => {

    console.log(allRoutePromisesData);

    _.forEach(allRoutePromisesData, (route, index ) => {

      if ( route['0'] ) {
        delete allRoutePromisesData[index]['0']
      }

    })

    console.log(allRoutePromisesData);
    return allRoutePromisesData

  }).then((finalData) => {

    let obj = {}
    _.forEach(finalData, (line, index) => {

      let key = Object.keys(line)[0]
      obj[key] = line[key]

    })

    console.log(obj);

    let file = './newData/schedule.json'
    jsonfile.writeFile(file, obj, (err) => {
      err ? console.log(err) : console.log('File Created')
      // if (err) console.log(err)
    })

  })
  
}

exports.listFilesInDirectory = function() {
  let dir = './final/'

  return new Promise((resolve, reject) => {
    fs.readdir(dir, function(err, files) {
      if (err) {
        reject(err)
      } else resolve(files)
    })
  })
  .then(filenames => {
    // filter only filenames for route names
    filenames = _.filter(filenames, (filenames) => {
      return (filenames.length === 14 ) ? true : false
    })
    return filenames
    // console.log(filenames);
  })
  .then((filteredFilenames) => {
    let pairs = _.map(filteredFilenames, (filename) => {
      let name = filename.split('.')[0]
      let pair = name.split('-')
      return {
        filename: filename,
        pair: [pair[0], pair[1]]
      }
    })
    return pairs;
  })
  .then((itemsBeforeReadingFiles) => {
    // console.log(itemsBeforeReadingFiles);
    return itemsBeforeReadingFiles
  })
  .catch((error) => console.log(error))

}

exports.saveRouteFilesToFirebase = function() {

  this.listFilesInDirectory().then(filenames => {
    // fire.child('datastore').set(null)
    console.log(filenames);
    _.forEach(filenames, filename => {
      let file = `./final/${filename.filename}`

      new Promise((resolve, reject) => {
        jsonfile.readFile(file, (err, filedata) => {
          if (err) {
            reject(err)
          } else resolve(filedata)
        })
      })
      .then(data => {
        // console.log(data);
        let child = `datastore/journey/${filename.pair[0]}/${filename.pair[1]}`
        return fire.child(child).set(data)
      })
      .then(firePromise => {
        console.log(firePromise);
      })
      .catch(e => console.log(e))
    })
  }).catch(err => console.log(err))

}

exports.saveRouteFilesFromFirebase = function() {
  fire.child('datastore').once('value', snapshot => {
    let file = './final/routes.json'

    jsonfile.writeFile( file, snapshot.val(), (e) => {
      if(e) {
        console.log(e);
      }
    })
  })
}

exports.saveRouteFileToFirebase = function() {
  let file = './backend/schedule.json'
  jsonfile.readFile( file, (e, obj) => {
    if(e) {
      console.log(e);
    } else {

      fire.child('datastore/routes').set(obj)

    }
  })

  
}

exports.saveStationsToFile = function() {
  this.getStations().then(data => {
    console.log(data.val());
    let obj = data.val()
    let file = './backend/stations.json'

    jsonfile.writeFile( file, obj, (error) => {
      if (error) console.log(error)
    })
  })
}
