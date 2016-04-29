'use strict'

// libraries
import m from 'mithril'
import Bullet from 'bullet-pubsub'

import classNames from 'classnames'

// utilities
import Actions from '../actions.js'
import setState from '../helpers/set-state.js'

//helpers
import renderStationHeaderSection from '../helpers/render/render-station-header-section.js'
import renderTimeSelectionSection from '../helpers/render/render-time-selection-header-section.js'


//stores
import HeaderStore from '../stores/header-store.js'
// import StationsStore from '../stores/stations-store.js'
import JourneyStore from '../stores/journey-store.js'

//components
import searchToolbarComponent from './SearchToolbarComponent.js'

import 'polythene/layout/theme/theme'

//Polythene componenets
import polyToolbar from 'polythene/toolbar/toolbar'
import iconBtn from 'polythene/icon-button/icon-button'

import gIconSchedule from 'mmsvg/google/msvg/action/schedule'
import gGoIcon from 'mmsvg/google/msvg/content/send'
import clearIcon from 'mmsvg/google/msvg/content/clear'

// import textfield from 'polythene/textfield/textfield'
// import btn from 'polythene/button/button'
import Velocity from 'velocity-animate'

import { full, tall, white } from '../../css/journey-planner.scss'
import '../../css/journey-planner.scss'

const handlers = {
  schedule: (status) => {
    Actions.changeScheduleSelectionStatus({ defaultHeader: !status })
  },
  go: () => {
    Actions.findRoutes()
  }
}

const btn = function(icn, handler) {
  return m.component(iconBtn, {
    icon: {
      msvg: icn
    },
    events: {
      onclick: handler
    }
  })
}

const baseToolbar = function() {
  return m('div.layout.center-center', { class: classNames(full, tall) }, [
    btn(this.state.data.defaultHeader() ? gIconSchedule : clearIcon, handlers.schedule.bind(null, this.state.data.defaultHeader())),
    // bellow section should be conditional

    this.state.data.defaultHeader() ? renderStationHeaderSection.call(this) : renderTimeSelectionSection.call(this)
    ,
    // pass action parameter conditionally?
    btn(gGoIcon, this.state.data.defaultHeader() ? handlers.go.bind(null) : handlers.schedule.bind(null, this.state.data.defaultHeader()))

    // second displayed option is a section with textfield where user selects
    // time and date of the train departure
    // TimeSelectionComponent

  ])
}

const toolbar = function() {
  const searchState = this.state.data.searchActive()
  return m('div', [
    !searchState ? m.component(polyToolbar, {
      content: baseToolbar.call(this)
    }) : m.component(polyToolbar, {
      content: searchToolbarComponent
    })
  ])
}

const HeaderComponent = {
  //this state includes the journey store data
  // since we need the journey origin station and destination station
  // so we can change the text of the buttons accordingly
  state: {
    data: {
      searchActive: m.prop(false),
      journeyPlanner: m.prop({}),
      defaultHeader: m.prop(true)
    }
  },

  _onChange() {
    HeaderStore.getAll()
      .then(setState.bind(HeaderComponent))
  },

  _onJourneyStoreChange() {
    JourneyStore.getJourneyPlanner()
      .then(setState.bind(HeaderComponent))
  },

  controller(data) {
    this.onunload = function() {
      HeaderStore.removeChangeListener(HeaderComponent._onChange)
      JourneyStore.removeChangeListener(HeaderComponent._onJourneyStoreChange)
      Bullet.off('HEADER_RIPPLE')
    }
  },

  view(ctrl) {
    return toolbar.call(this)
  }
}

HeaderStore.addChangeListener(HeaderComponent._onChange)
JourneyStore.addChangeListener(HeaderComponent._onJourneyStoreChange)
// StationsStore.addChangeListener(HeaderComponent._onStationStoreChange)

export default HeaderComponent
