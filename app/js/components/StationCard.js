'use strict'

import m from 'mithril'
import _ from 'lodash'

import listTile from 'polythene/list-tile/list-tile'
import list from 'polythene/list/list'

import card from '../poly/card.js'

import StationTiles from '../components/StationTiles.js'

// let counter = 0

const C = function(connection) {
  // console.log(connection)
  // console.log(counter++)
  const ListOfStations = {

    state: {
      data: ''
    },

    _onChange() {
      console.log('change')
    },

    view(ctrl) {
      return m.component( card, {
        // here we need to have separate thingy if the connection has a transfer
        // os it's either an extra card or a list within the card only
        content: m.component(list, {
          tiles: [
            _.map(connection, (singleLine, index) => {
              return m.component( card, {
                content: m.component( list, {
                  tiles: [
                    _.map(connection, (single) => {
                      return m.component(StationTiles( single ))
                    })
                  ]
                })
              })
            })
          ]
        })
      })
    }
  }

  return ListOfStations
  
}

// const MC = m.component(card, {
//   content: m.component(list, {
//     header: {
//       title: 'text()'
//     },
//     tiles: [
//       m.component(listTile, {
//         content: m.component({controller: function() {}, view: function() {
//           return m('p', text)
//         }})
//       }),
//       m.component(listTile, {
//         title: 'Ali Connors',
//         subtitle: 'Brunch this weekend?',
//         icon: {
//           type: 'large',
//           src: 'app/list-tile/avatars/1.png'
//         }
//       })
//     ],
//     borders: true,
//     selectable: true
//   })
// })

// const view = function(ctrl) {
//   return MC
// }

// const MyCard = {

//   state: {
//     data: {
//       message: m.prop('hellow'),
//       showSidebar: m.prop(false)
//     }
//   },

//   // state: new State({ message: 'hellow', showSidebar: false }),

//   _onChange() {
//     console.log('STORE GET ALL')
//     // setState.call(App, Store.getAll())

//     // App.state = Store.getAll()
//     Store.getAll()
//       .then(setState.bind(MyCard))
//     //   .then(() => m.redraw())
//     //   .then(() => console.log(App.state.data.message()))
//   },

//   _onInitialData() {
//     // console.log(DataStore.getAll())
//     // m.startComputation()
//     // let state = DataStore.getAll()
//     console.log('INITIAL LOAD')
//     DataStore.getAll()
//       .then(setState.bind(App))
//     // m.endComputation()
//     // console.log(this.state)
//     // console.log(this.state)
//   },

//   controller(data) {

//     this.onunload = function() {
//       Store.removeChangeListener(MyCard._onChange)
//       DataStore.removeChangeListener(MyCard._onInitialData)
//       // Store.removeChangeListener(App.controller)
//     }
//     this.message = MyCard.state.data.message

//     // return {
//     //   onunload() {
//     //     Store.removeChangeListener(App._onChange)
//     //     DataStore.removeChangeListener(App._onInitialData)
//     //   },
//     //   message: App.state.data.message,
//     //   printMessage: (e) => console.log(e)
//     // }
//   },

//   // controller: Store.register('CUSTOM', function() {
//   //   App.state = Store.getAll()
//   // }),

//   view(ctrl) {
//     return MC
//   }

// }

// setInterval(function() {
//   // text('xyz')
//   MyCard.view = view
// }, 1000)

export default C
