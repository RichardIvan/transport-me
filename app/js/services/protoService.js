'use strict'

import URI from 'urijs'

const ProtoBuf = require('protobufjs')

const builder = ProtoBuf.loadProtoFile('../../../gtfs-realtime.proto')

const RealTime = builder.build('transit_realtime')

// const url = 'http://api.bart.gov/gtfsrt/tripupdate.aspx'

let url = URI(window.location.href)
console.log(url)
// const url = 'http://api.bart.gov/gtfsrt/tripupdate.aspx'

export default function() {

  fetch(url)
    .then(data => {
      console.log(data)
    })
  console.log(RealTime)
}
