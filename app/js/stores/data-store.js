'use strict'

import m from 'mithril'
import _ from 'lodash'

import Bullet from 'bullet-pubsub'
import Constants from '../constants.js'

const LOCAL_EVENT_NAME = Constants.DataStores.DATA_STORE
// yt 10:00
// store updates itself, noone updates it
// it is self contained universe for a logical domain

const DataConstructor = function(resp) {
  const responses = resp || []
  return {
    schedule: m.prop(responses[0] || ''),
    routes: m.prop(responses[1] || '')
  }
  
}

let _data

const Data = {

  getAll() {
    return new Promise((resolve, reject) => {
      resolve({ data: _data })
    })
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
      case Constants.ActionType.INITIALIZE_APP:

        console.log("INITIALIZING APPLICATION")

        const dataRequest = new Request('data/')
        const routesRequest = new Request('routes/')
        const requests = [dataRequest, routesRequest]

        const promises = _.map(requests, (request) => {
          return caches.match(request)
            .then((response) => response.json())
        })

        Promise.all(promises).then((responses) => {
          _data = new DataConstructor(responses)
        })
        .then(Data.emitChange)
        break
      default:
        break
    }
  }
}

// Bullet.on('INITIALIZE_APP', Data.dispatchIndex)

export default Data
