'use strict'

//libraries
import _ from 'lodash'

export default function(stations, station) {
  stations.then((names) => {
    const stationIndex = _.indexOf(names, station.toLowerCase())
    console.log(stationIndex)
    if (stationIndex > -1) {
      this.validStationIndex(stationIndex)
      this.validStation(true)
    } else {
      this.validStation(false)
      this.validStationIndex(-1)
    }
  })
}
