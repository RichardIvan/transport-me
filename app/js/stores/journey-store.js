'use strict'

'use strict'

import m from 'mithril'
import _ from 'lodash'
import moment from 'moment'

import Bullet from 'bullet-pubsub'
import Constants from '../constants.js'

//utilities
import Actions from '../actions.js'
import fetchRealtime from '../services/realtimeService.js'
import sortHelper from '../helpers/sort-helper.js'

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

const JourneyStore = {

  getAll() {
    // console.log(_data)
    return new Promise((resolve, reject) => {
      resolve({ data: _data })
    })
  },
  getJourneyPlanner() {
    return new Promise((resolve, reject) => {
      resolve({ 
        data: {
          journeyPlanner: _data.journeyPlanner
        }
      })
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
      // case Constants.ActionType.RETRIEVE_JOURNEY:

      //   console.log("RETRIEVE_JOURNEY")

      //   fetch('http://localhost:3000/journey/RICH/FRMT/departure/WKDY/0900')
      //   // .then(response => response)
      //   .then(res => res.json())
      //   // .then(response => response.json())
      //   .then(json => {
      //     _data.result(json)

      //     console.log(json)
      //     // _.forEach(json, route => {
      //     //   console.log(route[0][0][1])
      //     // })
      //   })
      //   .then(Journey.emitChange)
      //   .catch(er => console.log(er))

      //   // const dataRequest = new Request('data/')
      //   // const routesRequest = new Request('routes/')
      //   // const requests = [dataRequest, routesRequest]

      //   // const promises = _.map(requests, (request) => {
      //   //   return caches.match(request)
      //   //     .then((response) => response.json())
      //   // })



      //   // Promise.all(promises).then((responses) => {
      //   //   _data = new DataConstructor(responses)
      //   // })
      //   // .then(Data.emitChange)
      //   break
      case Constants.ActionType.SET_JOURNEY_STATION:
        // const stationType = payload.data.stationType
        // const stationName = payload.data.stationName
        // console.log(payload.data)
        // console.log(payload.data.stationName)

        _data.journeyPlanner()[payload.data.stationType] = {
          stationName: payload.data.stationName
        }

        JourneyStore.emitChange()
        break
      case Constants.ActionType.SET_DEPARTURE_TIME:
        _data.journeyPlanner()['departureTime'] = payload.data.departureTime
        break
      case Constants.ActionType.SET_SEARCH_STATUS:
        if (payload.data.searchActive) {
          const journey = _data.journeyPlanner()
          const origin = journey.origin
          const destination = journey.destination
          let stationName

          if (origin) {
            // console.log(origin)
            stationName = origin.stationName[1].toLowerCase()
          } else if (destination) {
            // console.log(destination)
            stationName = destination.stationName[1].toLowerCase()
          } else stationName = ''

          Actions.loadSearchBar({ name: stationName })
        }
        break
      case Constants.ActionType.FIND_ROUTES:
        const url = new URL(window.location.href)
        const urlOrigin = url.origin
        // console.log(url)
        // console.log(_data.journeyPlanner().departureTime)
        let time = moment(_data.journeyPlanner().departureTime, 'YYYY-MM-DDThh:mm')
        // console.log()
        if ( !time.isValid() ) {
          time = moment().local()
          // console.log(time)
        }
        // console.log(time)
        let day = time.day()
        if ( day > -1 || day < 5 ) {
          day = 'WKDY'
        } else if ( day === 5 ) {
          day = 'SAT'
        } else day = 'SUN'
        let hour = time.get('hour')
        if (hour < 10) {
          hour = `0${hour}`
        }
        let minutes = time.get('minute')

        if (minutes < -1 || minutes < 16) {
          minutes = '00'
        } else if ( minutes < 16 || minutes < 31 ) {
          minutes = '15'
        } else if (minutes < 31 || minutes < 46) {
          minutes = '30'
        } else minutes = '45'
        const timeString = `${hour}${minutes}`

        const origin = _data.journeyPlanner().origin.stationName[0]
        const destination = _data.journeyPlanner().destination.stationName[0]
        const urlToFetch = `${urlOrigin}/journey/${origin}/${destination}/departure/${day}/${timeString}`

        console.log(urlToFetch)

        fetch(urlToFetch)
        // fetch('http://localhost:3000/journey/RICH/FRMT/departure/WKDY/0900')
        // .then(response => response)
        .then(res => res.json())
        // .then(response => response.json())
        .then(sortHelper)
        .then(json => {
          console.log(json)
          _data.result(json)
          return json.length
        })
        .then((length) => {
          const arr = Array(length)
          arr.fill(true)
          Actions.changeCompactStatus(arr)
        })
        .then(fetchRealtime)
        // .then(JourneyStore.emitChange)
        break
      case Constants.ActionType.FILL_DELAYS:
        const delays = payload.data
        const delayIDs = _.map(delays, (delay) => {
          return delay.id
        })
        const results = _data.result()
        const resultIDs = _.map(results, (result) => {
          return result[0][0][0]
        })
        const resultIndexes = ''
        console.log(delayIDs)
        console.log(resultIDs)



        break
      default:
        break
    }
  }
}

// Bullet.on('INITIALIZE_APP', Data.dispatchIndex)

export default JourneyStore
