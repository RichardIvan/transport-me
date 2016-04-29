'use strict'

import moment from 'moment'

export default function(time, delay) {
  const momentTime = moment(time, 'HH:mm:ss')
  momentTime.add(delay, 's')
  return momentTime.format('HH:mm:ss')
}