'use strict'

import _ from 'lodash'

export default function(results) {
  return _.sortBy(results, (o) => {
    return o[0][0][1]
  })
}