'use strict'

//libraries
import _ from 'lodash'
import Bullet from 'bullet-pubsub'

export default function(stations, station) {
  stations.then((names) => {
    const stationIndex = _.indexOf(names, station.toLowerCase())
    if (stationIndex > -1) {
      this.validStationIndex(stationIndex)
      this.validStation(true)
      Bullet.trigger('ROTATE_GO')
    } else {
      this.validStation(false)
      this.validStationIndex(-1)
    }
  })
}
