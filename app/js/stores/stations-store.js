'use strict'

//libraries
import m from 'mithril'
import Bloodhound from 'bloodhound-js'
import Bullet from 'bullet-pubsub'
import _ from 'lodash'

//utilities
import Constants from '../constants.js'
import Actions from '../actions.js'

//helpers
import validateStation from '../helpers/validate-station.js'

const LOCAL_EVENT_NAME = Constants.DataStores.STORE

let engine 

const stations = fetch('http://localhost:3000/stations/')
  .then((res) => res.json())

const stationNames = stations.then((data) => {
  return _.map(data, (station) => station[1].toLowerCase())
})

stations.then((data) => {
  const keys = Object.keys(data)
  const localData = keys.map((key) => {
    return data[key]
  })
  // console.log(localData);
  engine = new Bloodhound({
    local: localData,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer(datum) {
      return Bloodhound.tokenizers.whitespace(datum[1])
    }
  })
})
.then(() => {
  engine.initialize()
})

//
// DATA
//

const _data = {
  results: m.prop([]),
  resultsPresent: m.prop(false),
  query: m.prop(''),
  validStation: m.prop(false),
  validStationIndex: m.prop(-1)
}

const handleEngineResponse = function(d) {
  _data.results(d)
  _data.resultsPresent(true)
  this.emitChange()
}

const StationsStore = {

  getAll() {
    return new Promise((resolve) => {
      resolve({ data: _data })
    })
    // return { data: _data }
  },

  resetStore() {
    console.log('RESETING STORE')
    // _data.results = m.prop([])
    // _data.resultsPresent = m.prop(false)
    _data.query = m.prop('')
    _data.validStation = m.prop(false)
    _data.validStationIndex = m.prop(-1)
    // StationsStore.emitChange()
  },

  getQuery() {
    return new Promise((resolve) => {
      resolve({ data: {
        query: _data.query,
        resultsPresent: _data.resultsPresent,
        validStation: _data.validStation
      } })
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
      case Constants.ActionType.SEARCH_STATIONS:
        if (!payload.data) {
          stations
            .then((names) => {
              console.log(names)
              _data.results(names)
              _data.resultsPresent(true)
              StationsStore.emitChange()
            })
        } else {
          engine.search(payload.data, handleEngineResponse.bind(StationsStore))
        }

        
        // stationNames.then((names) => {
        //   const stationIndex = _.indexOf(names, payload.data.toLowerCase())
        //   console.log(stationIndex)
        //   if (stationIndex > -1) {
        //     _data.validStationIndex(stationIndex)
        //     _data.validStation(true)
        //   } else {
        //     _data.validStation(false)
        //     _data.validStationIndex(-1)
        //   }

        //   StationsStore.emitChange()
        // })

        break
      case Constants.ActionType.INITIALIZE_APP:
        // HeaderStore.emitChange()
        break
      case Constants.ActionType.SELECT_STATION_RESULT:
        _data.query(payload.data)
        _data.results([])
        _data.resultsPresent(false)
        validateStation.call(_data, stationNames, payload.data)
        StationsStore.emitChange()
        // HeaderStore.emitChange()
        break
      case Constants.ActionType.SEARCH_STATIONS_QUERY:
        validateStation.call(_data, stationNames, payload.data)
        _data.query(payload.data)
        // _data.results([])
        // _data.resultsPresent(false)
        //actions .. this will trigger the serch station
        Actions.searchStations(payload.data)
        StationsStore.emitChange()
        break
      case Constants.ActionType.RETRIEVE_JOURNEY_VALID_STATION_NAME:
        console.log(payload.data)
        console.log(_data.validStation())
        if (_data.validStation()) {
          stations.then((data) => {

            console.log(data[_data.validStationIndex()])
            console.log(_data.validStationIndex())

            const dataForAction = {
              stationType: payload.data,
              stationName: data[_data.validStationIndex()]
            }
            console.log(dataForAction)
            Actions.setJourneyStation(dataForAction)
          })
          .then(() => {
            Actions.setSearchStatus({ searchActive: false })
          })
        }
        break
      case Constants.ActionType.RESET_SEARCH_BAR:
        this.resetStore()
        break
      default:
        break
    }
  }
}

// Bullet.on('TEST_STORE', Store.dispatchIndex)

export default StationsStore
