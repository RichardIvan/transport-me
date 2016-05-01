'use strict'

import m from 'mithril'

// import SW from './services/sw.js'
import Actions from './actions.js'

import App from './components/AppComponent.js'

import '../css/app.scss'

// register service worker
// const sw = new SW()
// sw.register('/')

Actions.initialize.call(this, { action: 'INITIALIZE_APP' })

const el = document.getElementById('app')
m.mount(el, App)
