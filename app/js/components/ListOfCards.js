'use strict'

import m from 'mithril'
import _ from 'lodash'

// import listTile from 'polythene/list-tile/list-tile'
import list from 'polythene/list/list'

import StationCard from './StationCard.js'

// import Journey Store
import JourneyStore from '../stores/journey-store.js'

import setState from '../helpers/set-state.js'

const List = {

  state: {
    data: []
  },

  _onChange() {
    console.log('JourneyStore GET ALL')
    JourneyStore.getAll()
      .then(setState.bind(List))
  },

  view(ctrl) {
    return m('div', [
      m.component(list, {
        header: {
          title: 'Connections'
        },
        tiles: [
          _.map(List.state.data, (connection, index) => {
            // console.log(connection)
            // console.log(StationCard)
            // console.log( index )
            return m.component(StationCard(connection))
          })
        ],
        // tiles: [
        //   StationCard,
        //   StationCard,
        //   StationCard
        // ],
        borders: true,
        selectable: true
      })
    ])
  }

}

// const myList = m.component(list, {
//   header: {
//     title: 'Connections'
//   },
//   tiles: [
//     StationCard,
//     StationCard,
//     StationCard
//   ],
//   borders: true,
//   selectable: true
// })

JourneyStore.addChangeListener(List._onChange)

export default List