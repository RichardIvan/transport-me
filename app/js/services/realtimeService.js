'use strict'

import URI from 'urijs'
import _ from 'lodash'
import Actions from '../actions.js'
// const url = 'http://api.bart.gov/gtfsrt/tripupdate.aspx'

const baseUrl = new URI(window.location.href)
const realtimeEndpoint = `http://${baseUrl.host()}/realtime/`
// const url = 'http://api.bart.gov/gtfsrt/tripupdate.aspx'

export default function() {
  if (navigator.onLine) {
    fetch(realtimeEndpoint)
      .then(data => data.json())
      .then((json) => {
        console.log(json)
        console.log(json.length)
        const delayedTrips = _.filter(json, (entity) => {
          // console.log(entity.length)
          // console.log(entity.id)
          return entity.trip_update.stop_time_update[0].departure.delay !== 0
        })
        console.log(delayedTrips)
        if (!_.isEmpty(delayedTrips)) {
          Actions.fillDelays(delayedTrips)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
}
