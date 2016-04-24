'use strict'

//libraries
import m from 'mithril'
import Bullet from 'bullet-pubsub'
import _ from 'lodash'

//stores
import StationsStore from '../stores/stations-store.js'

//utilities
import setState from '../helpers/set-state.js'
import Actions from '../actions.js'

//poly
// import dialog from 'polythene/dialog/dialog'
import card from 'polythene/card/card';

import menu from 'polythene/menu/menu';
import list from 'polythene/list/list';
import listTile from 'polythene/list-tile/list-tile';


//componenets


//styles
import '../../css/search-container.scss'

import resultsStyles from '../../css/results.scss'
import { single_height, side_padding } from 'polythene/list-tile/theme/config'
const mHeight = (single_height + side_padding) * 8 + 'px'


const handleSelection = function(stationName) {
  Actions.selectStationResult(stationName)
  // console.log(stationShortname) 
}


const resultSection = function() {
  let self = this
  return m('div.flex', { style: { overflow: 'visible' } } ,[
    m.component(card, {
      id: 'shadow-target',
      content: m('div#search-container', [

        m.component(menu, {
          target: 'search-container', // to align with the link
          offset: 0, // horizontally align with link
          // show: false, // should the menu be open or closed?
          permanent: true,
          // didHide: () => (ctrl.open = false), // called after closing
          content: m('div#results-container', { class: resultsStyles['results-container'], style: { maxHeight: mHeight } }, [

            m.component(list, {
              borders: true,
              tiles: [
                _.map(self.state.data.results(), (result) => {
                  return m.component(listTile, {
                    title: result[1],
                    ink: true,
                    events: {
                      onclick: handleSelection.bind(null, result[1])
                    }
                  })
                })
              ]
            })

          ])

        })

      ])
    })
  ])
}

const StationResultsMenu = {

  state: {
    data: {
      resultsPresent: m.prop(false),
      results: m.prop([])
    }
  },

  _onChange() {
    // console.log('menu store or something changed')
    StationsStore.getAll()
      .then(setState.bind(StationResultsMenu))
  },

  _onInit() {
    console.log('initial data')
  },

  controller(data) {

    this.onunload = function() {
      StationsStore.removeChangeListener(StationResultsMenu._onChange)
      // Store.removeChangeListener(StationResultsMenu._onChange)
      // DataStore.removeChangeListener(StationResultsMenu._onInitialData)
      // Bullet.off('HEADER_RIPPLE')
      // Store.removeChangeListener(App.controller)
    }

  },

  view(ctrl) {
    return m('div.horisontal.layout', { style: { width: '100%', height: 0 } }, [
      m('div', { style: { width: '64px' } }),
      (StationResultsMenu.state.data.resultsPresent()) ? resultSection.call(StationResultsMenu) : m('div.flex'),
      m('div', { style: { width: '64px' } })
    ])
  }
}

StationsStore.addChangeListener(StationResultsMenu._onChange)

export default StationResultsMenu

