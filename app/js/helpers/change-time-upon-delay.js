'use strict'

//libraries
import _ from 'lodash'

//helpers
import transformTime from '../helpers/time/transform-time.js'

export default function(result, diff) {
  _.forEach(result[0], (station) => {
    const newTime = transformTime(station[1], diff)
    station[1] = newTime
    station[2] = newTime
  })
  console.log(result)
  return result
}
