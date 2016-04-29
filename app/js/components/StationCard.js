'use strict'

//libraries
import m from 'mithril'
import _ from 'lodash'
// const debug = require('debug')

//utilities
import Actions from '../actions.js'

//poly components
import list from 'polythene/list/list'

//components
import card from '../poly/card.js'
import StationTiles from '../components/StationTiles.js'

//styles
import { cardStyle } from '../../css/card-style.scss'



export default function(connection, index, compactBootlean, realtime) {
  return m.component(card, {
    // here we need to have separate thingy if the connection has a transfer
    // os it's either an extra card or a list within the card only
    content: m.component(list, {
      // class: cardStyle,
      tiles: [
        // _.map(connection, (line) => {
        //   // you have a card component also <- for the shadow
        //   return m.component(listTile, {
        //           content: m.component(list, {
        //             // class: cardStyle,
        //             header: {
        //               title: 'hello world'
        //             },
        //             tiles: [
        //               compactPart([_.first(line), _.last(line)])
        //               // compactBootlean ? 
        //               // _.map(line, (station) => {

        //               //   return m.component(tile, {
        //               //     content: 
        //               //   })

        //               // })
        //             ]
        //           })
        //           })
        // })
        // this card - no good <-
        m.component(card, {
          class: cardStyle,
          content: m.component(list, {
            tiles: [
              // here is the compact check
              _.map(connection, (single) => StationTiles(single, compactBootlean, realtime))
            ]
          }),
          events: {
            onclick: (e) => {
              Actions.changeCompactStatus({ index, status: !compactBootlean })
            }
          }
        })
      ]
    })
  })
}

// let counter = 0
// let subscribed = false

// let con

// const ListOfStations = {

//   state: {
//     data: {
//       compact: m.prop(true)
//     }
//   },

//   _onChange() {
//     CardStore.getAll()
//       .then(setState.bind(ListOfStations))
//       .then(() => {
//         console.log(ListOfStations.state.data.compact())
//       })
//   },

//   controller(data) {
//     this.onunload = function() {
//       CardStore.removeChangeListener(ListOfStations._onChange)
//       subscribed = false
//     }
//   },

//   view(ctrl) {
//     return m.component(card, {
//       // here we need to have separate thingy if the connection has a transfer
//       // os it's either an extra card or a list within the card only
//       content: m.component(list, {
//         tiles: [
//           m.component(card, {
//             content: m.component(list, {
//               tiles: [
//                 // here is the compact check
//                 _.map(con, (single) => {
//                   console.log(ListOfStations.state.data.compact())
//                   return m.component(StationTiles(single, ListOfStations.state.data.compact()))
//                 })
//               ]
//             }),
//             events: {
//               onclick: (e) => {
//                 console.log(e)
//                 console.log(ListOfStations.state.data.compact())
//                 console.log(!ListOfStations.state.data.compact())
//                 Actions.changeCompactStatus(!ListOfStations.state.data.compact())
                
//                 //trigger compact change
//               }
//             }
//           })
//         ]
//       })
//     })
//   }
// }

// class Card {
//   constructor(connection, index) {
//     const self = this
//     this.connection = connection;
//     this.index = index

//     // console.log('INDEX')
//     // console.log(this.index)

//     this.state = {
//       data: {
//         compact: m.prop(true)
//       }
//     }

//     this._onChange = () => {
//       CardStore.getAll()
//         .then(setState.bind(self))
//         .then(() => {
//           console.log(self.state.data.compact())
//         })
//     }

//     this.controller = (data) => {
//       this.onunload = function() {
//         CardStore.removeChangeListener(self._onChange)
//         subscribed = false
//       },
//       this.config = ( el, inited ) => {
//         if (!inited) {
//           console.log('subscribed listener')
//           CardStore.addChangeListener(ListOfStations._onChange)
//         }
//       }
//     }

//     this.view = (ctrl) => {
//       return m.component(card, {
//         // here we need to have separate thingy if the connection has a transfer
//         // os it's either an extra card or a list within the card only
//         content: m.component(list, {
//           tiles: [
//             m.component(card, {
//               content: m.component(list, {
//                 tiles: [
//                   // here is the compact check
//                   _.map(self.connection, (single) => {
//                     console.log(self.state.data.compact())
//                     return m.component(StationTiles(single, self.state.data.compact()))
//                   })
//                 ]
//               }),
//               events: {
//                 onclick: (e) => {
//                   console.log(e)
//                   console.log(self.state.data.compact())
//                   console.log(!self.state.data.compact())
//                   Actions.changeCompactStatus(!self.state.data.compact())
                  
//                   //trigger compact change
//                 }
//               }
//             })
//           ]
//         })
//       })
//     }
//   }

//   // methods
// }  

// const myCard = newCard

// const C = function(connection, index) {
//   const ListOfStations = new Card(connection, index)
//   // if (!subscribed) {
//   //   CardStore.addChangeListener(ListOfStations._onChange)
//   //   console.log('subscribed')
//   //   console.log(subscribed)
//   //   subscribed = true
//   // 
//   return ListOfStations
// }


// export default C
