'use strict'

import m from 'mithril'
import _ from 'lodash'

import listTile from 'polythene/list-tile/list-tile'

import styles from '../../css/app.scss'

const compactPart = function(stations) {
  const first = _.first(stations)
  const last = _.last(stations)

  const array = [
    m('ul', [
      m('li', { class: styles.inlineList }, first[1]),
      m('li', { class: styles.inlineList }, first[3])
    ]),
    m('ul', [
      m('li', { class: styles.inlineList }, last[1]),
      m('li', { class: styles.inlineList }, last[3])
    ])
  ]
  return array
}

const fullPart = (stations) => {
  return  _.map(stations, (station) => {
            // console.log(station)
            return m('ul', [
              m('li', { class: styles.inlineList }, station[1]),
              m('li', { class: styles.inlineList }, station[3])
            ])
          })
}

const C = function(stations, compact) {
  // console.log("PRINTING")
  // console.log(stations)
  const ListOfStations = {

    state: {
      data: ''
    },

    _onChange() {
      console.log('change')
    },

    view(ctrl) {
      return m.component(listTile, {
        content: [
          compact ? compactPart(stations) : fullPart(stations)
        ]

      })
    }
  }

  return ListOfStations
}

export default C
