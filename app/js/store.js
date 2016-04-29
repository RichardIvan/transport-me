'use strict'

import m from 'mithril'

import Bullet from 'bullet-pubsub'
import Constants from './constants.js'

const LOCAL_EVENT_NAME = Constants.DataStores.STORE

// yt 10:00
// store updates itself, noone updates it
// it is self contained universe for a logical domain

// setInterval(function() {
//   console.log('redraw')
//   m.redraw()
// }, 1000)

const _data = {
  showSidebar: m.prop(false),
  message: m.prop('hellow')
}


const Store = {

  getAll() {
    return new Promise((resolve, reject) => {
      resolve({ data: _data })
    })
    // return { data: _data }
  },
  // Allow Controller-View to register itself with store
  addChangeListener(callback) {
    Bullet.on(LOCAL_EVENT_NAME, callback)
  },
  removeChangeListener(callback) {
    Bullet.off(LOCAL_EVENT_NAME, callback)
  },
  emitChange() {
    Bullet.trigger(LOCAL_EVENT_NAME)
  },

  dispatchIndex(payload) {
    // console.log('PAYLOAD', payload)
    switch (payload.action) {
      case Constants.ActionTypes.TEST_STORE:
        _data.message('test store works')
        Store.emitChange()
        break
      case Constants.ActionTypes.SHOW_SIDEBAR:
        _data.showSidebar = true
        Store.emitChange()
        break
      case Constants.ActionTypes.HIDE_SIDEBAR:
        _data.showSidebar = false
        Store.emitChange()
        break
      default:
        break
    }
  }
}

// Bullet.on('TEST_STORE', Store.dispatchIndex)

export default Store
