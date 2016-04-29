'use strict'

import moment from 'moment'

export default function(start, finish) {
  const momentStart = moment(start, 'HH:mm:ss')
  const momentFinish = moment(finish, 'HH:mm:ss')

  return momentFinish.diff(momentStart, 'minutes')
}
