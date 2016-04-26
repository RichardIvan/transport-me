'use strict'

import Constants from './constants.js'
import Dispatcher from './dispatcher.js'

// 15:00
// action creation could be also the initialization

// action can trigger an api call therefore bypass dispatcher

// data coming in here is a objet literal containing new fields of data and specific action type

// this is action Creator
// it exports actions

export default {

  initialize() {
    Dispatcher({
      action: Constants.ActionType.INITIALIZE_APP
    })
  },
  getJourney(data) {
    Dispatcher({
      action: Constants.ActionType.RETRIEVE_JOURNEY,
      data
    })
  },
  findRoutes() {
    Dispatcher({
      action: Constants.ActionType.FIND_ROUTES
    })
  },


  //HEADER
  setSearchStatus(data) {
    Dispatcher({
      action: Constants.ActionType.SET_SEARCH_STATUS,
      data
    })
  },
  resetSearchBar() {
    Dispatcher({
      action: Constants.ActionType.RESET_SEARCH_BAR
    })
  },
  searchStations(data) {
    Dispatcher({
      action: Constants.ActionType.SEARCH_STATIONS,
      data
    })
  },
  setStationSearchQuery(data) {
    Dispatcher({
      action: Constants.ActionType.SEARCH_STATIONS_QUERY,
      data
    })
  },
  selectStationResult(data) {
    Dispatcher({
      action: Constants.ActionType.SELECT_STATION_RESULT,
      data
    })
  },
  changeScheduleSelectionStatus(data) {
    Dispatcher({
      action: Constants.ActionType.SET_HEADER_STATUS,
      data
    })
  },
  setDepartureTime(data) {
    Dispatcher({
      action: Constants.ActionType.SET_DEPARTURE_TIME,
      data
    })
  },
  loadSearchBar(data) {
    Dispatcher({
      action: Constants.ActionType.LOAD_SEARCH_BAR,
      data
    })
  },


  // set journey station
  // set into the journey store if the station is origin or destination
  getStationType() {
    // present in header store
    Dispatcher({
      action: Constants.ActionType.GET_STATION_TYPE
    })
  },
  getValidStationName(data) {
    //present in station-store
    Dispatcher({
      action: Constants.ActionType.RETRIEVE_JOURNEY_VALID_STATION_NAME,
      data
    })
  },
  setJourneyStation(data) {
    // console.log(data)
    Dispatcher({
      action: Constants.ActionType.SET_JOURNEY_STATION,
      data
    })
  },

  //cards
  changeCompactStatus(data) {
    Dispatcher({
      action: Constants.ActionType.COMPACT_CHANGE,
      data
    })
  }
}

// export default {

//   testStore(data) {
//     Dispatcher({
//       type: Constants.ActionTypes.TEST_STORE,
//       data
//     })
//   },
//   showSidebar() {
//     Dispatcher({
//       type: Constants.ActionTypes.SHOW_SIDEBAR
//     })
//   },
//   hideSidebar() {
//     Dispatcher({
//       type: Constants.ActionTypes.HIDE_SIDEBAR
//     })
//   }
// }
