'use strict'

'use strict'

import m from 'mithril'
import _ from 'lodash'

import Bullet from 'bullet-pubsub'
import Constants from '../constants.js'

const LOCAL_EVENT_NAME = Constants.DataStores.JOURNEY_STORE
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

const _data = {
  result: m.prop(''),
  journeyPlanner: m.prop({})
  // journeyPlanner: m.prop({
  //   stationType: m.prop({
  //     stationName: m.prop('')
  //   }),
  //   departureTime: m.prop(-1),
  //   arrivalTime: m.prop(-1),
  //   isComplete: m.prop(false)
  // })
}

const Journey = {

  getAll() {
    console.log(_data)
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
      case Constants.ActionType.RETRIEVE_JOURNEY:

        console.log("RETRIEVE_JOURNEY")

        fetch('http://localhost:3000/journey/RICH/FRMT/departure/WKDY/0900')
        // .then(response => response)
        .then(res => res.json())
        // .then(response => response.json())
        .then(json => {
          _data.result(json)

          console.log(json)
          // _.forEach(json, route => {
          //   console.log(route[0][0][1])
          // })
        })
        .then(Journey.emitChange)
        .catch(er => console.log(er))

        // const dataRequest = new Request('data/')
        // const routesRequest = new Request('routes/')
        // const requests = [dataRequest, routesRequest]

        // const promises = _.map(requests, (request) => {
        //   return caches.match(request)
        //     .then((response) => response.json())
        // })



        // Promise.all(promises).then((responses) => {
        //   _data = new DataConstructor(responses)
        // })
        // .then(Data.emitChange)
        break
      case Constants.ActionType.SET_JOURNEY_STATION:
        // const stationType = payload.data.stationType
        // const stationName = payload.data.stationName
        console.log(payload.data)
        console.log(payload.data.stationName)

        _data.journeyPlanner()[payload.data.stationType] = {
          stationName: payload.data.stationName
        }

        console.log(_data.journeyPlanner())
        break
      case Constants.ActionType.GET_JOURNEY_STATION:
        //accepts id which is type origin/destination
        break
      default:
        break
    }
  }
}

// Bullet.on('INITIALIZE_APP', Data.dispatchIndex)

export default Journey
