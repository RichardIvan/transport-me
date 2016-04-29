'use strict'

import m from 'mithril'

import SW from './services/sw.js'
import Actions from './actions.js'

import App from './components/AppComponent.js'

import '../css/app.scss'

import RealTimeService from '../js/services/realtimeService.js'

// register service worker
const sw = new SW()
sw.register('/')

Actions.initialize.call(this, { action: 'INITIALIZE_APP' })

const el = document.getElementById('app')
m.mount(el, App)

console.log(Actions)

// fetch('http://localhost:3000/stations/')
//   .then((res) => res.json())
//   .then((json) => {
//     console.log(json)
//   })
//   .catch((er) => console.log(er))

// fetch('http://localhost:3000/journey/RICH/FRMT/departure/WKDY/0900')
//   // .then(response => response)
//   .then(res => res.json())
//   // .then(response => response.json())
//   .then(json => {
//     _.forEach(json, route => {
//       console.log(route[0][0][1])
//     })
//   })
//   .catch(er => console.log(er))
