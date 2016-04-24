'use strict'

import _ from 'lodash'
import now from 'performance-now'

console.log(self)

export default function Data() {
  let url = new URL(window.location)

  console.log(url)

  let load = function(endpoint) {
    url.pathname = `${endpoint}`
    // probably want to cache this here
    // probably want to cache this on load of the app
    console.log(url.href)
    return fetch(`${url.href}`).then(response => response.json())
  }

  const lines = {}

  this.getLines = function(lineNumber) {
    return lines[lineNumber] || lines
  }
  this.setLines = function(lineNumber, dayType, data) {
    if (!data) return
    (lines[lineNumber] || (lines[lineNumber] = {}))
    if (!dayType) {
      return lines[lineNumber] = data
    }
    // (lines[lineNumber] || );
    if (lines[lineNumber][dayType] || (lines[lineNumber][dayType] = {}))
    return lines[lineNumber][dayType] = data
    // lines[lineNumber] = data
    // return lines[lineNumber]
  }
  // this.loader = {
  //   load: load
  // }

  // this.promisedStations = load('data/stops')
  console.log('about to load dat shit')
  console.log('start now')
  const start = now()
  this.promisedTrips = load('data/trips').then(trips => {

    let tripObject = {}

    this.promisedStations.then((stops) => {
      const groupedStops = _.groupBy(stops, (stop) => stop[0])
      // console.log(groupedStops)

      const group = _.groupBy(trips, (stop) => stop[6])
      // const groupKeys = Object.keys(group)
      _.forEach(group, (arrayOfLinesByLineName) => {

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
      const end = now()
      const duration = (start - end).toFixed(3) * -1
      console.log(`${duration} ms`)
      console.log(tripObject)
    })
  })
    
    
  // this.promisedRoutes = load('routes')

  // let stations = load('stops')
  // let trips = getFile('trips')
  // let routes = getFile('routes')

}

Data.prototype.getStations = function() {
  // return this.promisedStations.then(stations => stations).catch(e => console.log(e))
}

Data.prototype.getTrips = function() {
  // return this.loader.load('trips').then(stations => stations.json())
};

Data.prototype.getRoutes = function() {
  // return this.loader.load('routes').then(stations => stations.json())
};
