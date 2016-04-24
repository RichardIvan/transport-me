'use strict'

import m from 'mithril'


import Actions from '../actions.js'

import Store from '../store.js'
import DataStore from '../stores/data-store.js'
import HeaderStore from '../stores/header-store.js'

import setState from '../helpers/set-state.js'

import headerComponent from '../components/HeaderComponent.js'
// import setInitialState from '../helpers/set-initial-state.js'

import headerPanel from 'polythene/header-panel/header-panel'

//components
import ListOfCards from './ListOfCards.js'
import stationResultsMenu from './StationResultsMenuComponent.js'

import { toolBarSize } from '../../css/app.scss'

const myHeaderPanel = function() {
  return m.component(headerPanel, {
    fixed: true,
    // class: toolBarSize,
    header: {
      // content: [myBtn],
      // toolbar: {
      //   mode: 'tall',
      //   // top bar pass component, that is a picker of stations and stuff
      //   topBar: 'Top bar',
      //   bottomBar: m('button', { onclick: handleClick }, 'GET JOURNEY' )
      // }
      // toolbar: {
      //   mode: 'tall',
      //   content: journeyPlanner
      // }
      // noReveal: true,
      // tallClass: 'tall',
      // fixed: true
      content: headerComponent,
      class: toolBarSize
    },
    content: m('.list', [
      this.state.data.searchActive() ? stationResultsMenu : m('div.horisontal.layout', { style: { width: '100%', height: 0 } }),
      ListOfCards
    ])
  })
}

const App = {

  state: {
    data: {
      searchActive: m.prop(false)
    }
  },

  // state: new State({ message: 'hellow', showSidebar: false }),

  _onChange() {
    Store.getAll()
      .then(setState.bind(App))
  },

  _onHeaderChange() {
    HeaderStore.getAll()
      .then(setState.bind(App))
  },

  _onInitialData() {
    console.log('INITIAL LOAD')
    // DataStore.getAll()
    //   .then(setState.bind(App))
    // HeaderStore.getAll()
    //   .then(setState.bind(App))
  },

  controller(data) {

    this.onunload = function() {
      Store.removeChangeListener(App._onChange)
      HeaderStore.removeChangeListener(App._onHeaderChange)
    }
  },

  view(ctrl) {
    return m('.app', [
      myHeaderPanel.call(this)
    ])
  }
}

Store.addChangeListener(App._onChange)
HeaderStore.addChangeListener(App._onHeaderChange)

// DataStore.addChangeListener(App._onInitialData)
// HeaderStore.addChangeListener(App._onInitialData)
// Store.addChangeListener(App.controller)
// Store.addChangeListener(App.controller)

export default App