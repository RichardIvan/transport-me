'use strict'

export default function Data() {
  let baseUrl = window.location

  let stations = fetch('stations')
  let trips = fetch('trips')
  let routes = fetch('routes')

  this.stations = function() {
    console.log(baseUrl)
    return stations()
  }
  this.trips = function() {
    return trips()
  }
  this.routes = function() {
    return trips()
  }

  // let stations = getFile('stations')
  // let trips = getFile('trips')
  // let routes = getFile('routes')

}

Data.prototype.get = function() {
  console.log('getting trips')
  console.log(trips)
  console.log(trips())
};
