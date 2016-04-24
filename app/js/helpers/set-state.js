'use strict'

import m from 'mithril'
import _ from 'lodash'

export default function(newData) {
  m.startComputation()
  this.state = _.merge(this.state, newData)
  m.endComputation()
}
