'use strict'

//libraries
import m from 'mithril'
import Bloodhound from 'bloodhound-js'
import Bullet from 'bullet-pubsub'
import _ from 'lodash'
import debug from 'debug'

//utilities
import Constants from '../constants.js'
import Actions from '../actions.js'

//helpers
import validateStation from '../helpers/validate-station.js'

const LOCAL_EVENT_NAME = Constants.DataStores.STATIONS_STORE

let engine

const stations = fetch('/transport-me/stations/')
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
  validStationIndex: m.prop(-1),
  stationToFilterFromResults: m.prop('')
}

const filterResults = (r) => {
  if (_data.stationToFilterFromResults()) {
    return _.filter(r, (o) => {
      return o[1].toLowerCase() !== _data.stationToFilterFromResults()
    })
  } else return r
}

const handleEngineResponse = function(d) {
  _data.results(filterResults(d))
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
    _data.query = m.prop('')
    _data.validStation = m.prop(false)
    _data.validStationIndex = m.prop(-1)
    _data.stationToFilterFromResults = m.prop('')
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
    // console.log('PAYLOAD', payload)
    switch (payload.action) {
      case Constants.ActionType.SEARCH_STATIONS:
        if (!payload.data) {
          stations
            .then((names) => {
              _data.results(filterResults(names))
              _data.resultsPresent(true)
              StationsStore.emitChange()
            })
        } else {
          engine.search(payload.data, handleEngineResponse.bind(StationsStore))
        }
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
        Actions.searchStations(payload.data)
        StationsStore.emitChange()
        break
      case Constants.ActionType.RETRIEVE_JOURNEY_VALID_STATION_NAME:
        if (_data.validStation()) {
          stations.then((data) => {
            const dataForAction = {
              stationType: payload.data,
              stationName: data[_data.validStationIndex()]
            }
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
      case Constants.ActionType.SET_JOURNEY_STATION:
        break
      case Constants.ActionType.LOAD_SEARCH_BAR:
        _data.stationToFilterFromResults(payload.data.name.toLowerCase())
        break
      default:
        break
    }
  }
}

// Bullet.on('TEST_STORE', Store.dispatchIndex)

export default StationsStore
