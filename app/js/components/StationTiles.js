'use strict'

import m from 'mithril'
import _ from 'lodash'

import listTile from 'polythene/list-tile/list-tile'
import list from 'polythene/list/list'

import card from '../poly/card.js'

import StationTiles from '../components/StationTiles.js'

import styles from '../../css/app.scss'

const C = function(stations) {
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
      return m.component( listTile, {
        content: [

          _.map(stations, (station) => {
            // console.log(station)
            return m('ul', [
              m('li', { class: styles.inlineList }, station[1]),
              m('li', { class: styles.inlineList }, station[3])
            ])
          })

        ]

      })
    }
  }

  return ListOfStations
}

export default C
