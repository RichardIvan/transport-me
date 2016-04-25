'use strict'

export default {
  CHANGE_EVENT: 'CHANGE_EVENT',

  ActionTypes: {
    TEST_STORE: 'TEST_STORE',
    SHOW_SIDEBAR: 'SHOW_SIDEBAR',
    HIDE_SIDEBAR: 'HIDE_SIDEBAR'
  },

  ActionType: {
    INITIALIZE_APP: 'INITIALIZE_APP',
    RETRIEVE_JOURNEY: 'RETRIEVE_JOURNEY',
    SET_SEARCH_STATUS: 'SET_SEARCH_STATUS',
    RESET_SEARCH_BAR: 'RESET_SEARCH_BAR',

    SEARCH_STATIONS: 'SEARCH_STATIONS',
    SEARCH_STATIONS_QUERY: 'SEARCH_STATIONS_QUERY',
    SELECT_STATION_RESULT: 'SELECT_STATION_RESULT',

    GET_STATION_TYPE: 'GET_STATION_TYPE',
    RETRIEVE_JOURNEY_VALID_STATION_NAME: 'RETRIEVE_JOURNEY_VALID_STATION_NAME',
    SET_JOURNEY_STATION: 'SET_JOURNEY_STATION'
  },

  DataStores: {
    DATA_STORE: 'DATA_STORE',
    STORE: 'STORE',
    JOURNEY_STORE: 'JOURNEY_STORE'
  }
}
