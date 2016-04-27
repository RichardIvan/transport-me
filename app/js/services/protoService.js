'use strict'

import URI from 'urijs'
import _ from 'lodash'

// const url = 'http://api.bart.gov/gtfsrt/tripupdate.aspx'

const baseUrl = new URI(window.location.href)
const realtimeEndpoint = `http://${baseUrl.host()}/realtime/`
// const url = 'http://api.bart.gov/gtfsrt/tripupdate.aspx'

export default function() {
  // var req = request({ uri: realtimeEndpoint }, (err, response, body) => {
  //   console.log(response.statusCode)
  //   if (body) {
  //     // console.log(RealTime.TripUpdate.StopTimeUpdate.decode)
  //     console.log(RealTime.TripUpdate.StopTimeEvent.decodeJSON(body))
  //     // console.log(RealTime.TripUpdate.StopTimeUpdate.decodeDelimited(body))
  //   }
  // })

  fetch(realtimeEndpoint)
    .then(data => data.json())
    .then((json) => {
      console.log(json)
      _.forEach(json, (entity) => {
        console.log(entity.trip_update)
      })
    })
    .catch((err) => {
      console.log(err)
    })
}
