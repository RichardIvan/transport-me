'use strict'

//libraries
import m from 'mithril'
import _ from 'lodash'

//utilities
import setState from '../helpers/set-state.js'

//poly components
// import listTile from 'polythene/list-tile/list-tile'
import list from 'polythene/list/list'

//components
import StationCard from './StationCard.js'

// import Journey Store
import JourneyStore from '../stores/journey-store.js'
import CardStore from '../stores/cards-store.js'

const List = {

  state: {
    data: {
      result: m.prop([]),
      compact: m.prop([])
    }
  },

  _onChange() {
    JourneyStore.getAll()
      .then(setState.bind(List))
  },

  _onCompactChange() {
    CardStore.getAll()
      .then(setState.bind(List))
  },

  controller(data) {
    this.onunload = function() {
      CardStore.removeChangeListener(List._onCompactChange)
      JourneyStore.removeChangeListener(List._onChange)
    }
  },

  view(ctrl) {
    const result = List.state.data.result()
    const compactValuesArray = List.state.data.compact()
    return m('div', [
      m.component(list, {
        header: {
          title: 'Connections'
        },
        tiles: [
          _.map(result, (connection, index) => StationCard(connection, index,compactValuesArray[index]))
        ],
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
CardStore.addChangeListener(List._onCompactChange)

export default List