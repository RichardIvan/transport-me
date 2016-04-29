'use strict'

import m from 'mithril'

import Bullet from 'bullet-pubsub'
import Constants from '../constants.js'

//utilities
import Actions from '../actions.js'

const LOCAL_EVENT_NAME = Constants.DataStores.HEADER_STORE

const _data = {
  searchActive: m.prop(false),
  defaultHeader: m.prop(true)
}

const HeaderStore = {

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
    console.log('PAYLOAD', payload)
    switch (payload.action) {
      case Constants.ActionType.SET_SEARCH_STATUS:
        _data.searchActive(payload.data.searchActive)
        if (!payload.data.searchActive) {
          Actions.resetSearchBar()
        }
        HeaderStore.emitChange()
        break
      case Constants.ActionType.INITIALIZE_APP:
        console.log('INITIAL HEADER LOAD')
        HeaderStore.emitChange()
        break
      case Constants.ActionType.GET_STATION_TYPE:
        Actions.getValidStationName(_data.searchActive())
        break
      case Constants.ActionType.SET_HEADER_STATUS:
        _data.defaultHeader(payload.data.defaultHeader)
        break
      default:
        break
    }
  }
}

// Bullet.on('TEST_STORE', Store.dispatchIndex)

export default HeaderStore
