'use strict'

// libraries
import m from 'mithril';
import Velocity from 'velocity-animate'
import Bullet from 'bullet-pubsub'

//utilities
import classNames from 'classnames'
import Actions from '../actions.js'
import setState from '../helpers/set-state.js'

//styles
import '../../css/search-field.scss'
import { fullWidth, fullHeight, clearBtn, forwardBtn, above } from '../../css/search-toolbar-component.scss'

//poly components
import search from 'polythene/search/search';
import iconButton from 'polythene/icon-button/icon-button'


import iconForward from 'mmsvg/google/msvg/navigation/arrow-forward'
import clear from 'mmsvg/google/msvg/content/clear'

//stores
import StationsStore from '../stores/stations-store.js'


let handleClearClick = (e) => {
  //close set the header to false
  // clear input value
  Actions.setSearchStatus({ searchActive: false })
}

// this is being triggered only when the station in the field is valid anyway
const handleForwardClick = function(e) {
  //have this available on check and show a notificatino stating that the station is invalid?
  if (!this.state.data.validStation())
    return
  Actions.getStationType()
}

const btnClear = m.component(iconButton, {
  class: clearBtn,
  icon: {
    msvg: clear
  },
  events: {
    onclick: handleClearClick
  }
})

function rotateElement() {
  const el = document.getElementById('choose-station-button')
  Velocity(el, { 
    x: '+=200', y: '25%', rotateZ: 360
  }),
  Velocity(el, { 
    x: '+=200', y: '25%', rotateZ: 0
  }, {
    duration: 0
  })
}

function rotate(el, initiated) {
  if (!initiated) {
    const element = el
    Bullet.on('ROTATE_GO', rotateElement)
    element.onunload = () => {
      Bullet.off('ROTATE_GO')
    }
  }
}

const btnForward = function() {
  return m.component(iconButton, {
    id: 'choose-station-button',
    icon: {
      msvg: iconForward
    },
    // raised: this.state.data.validStation(),
    // disabled: !this.state.data.validStation(),
    events: {
      onclick: handleForwardClick.bind(this)
    },
    config: rotate
  })
}

const fadeIn = function(el, initiated, context, virEl) {

  if(!initiated) {

    el.style.opacity = 0;
    Velocity(el, {
      opacity: 1
    }, {
      duration: 300
    })
  }
}

const searchHandler = function(e) {
  if (e.value === this.state.data.query()) {
    if (this.state.data.resultsPresent()) return
    if (e.value === '') {
      Actions.setStationSearchQuery(e.value)
    }
  } else {
    Actions.setStationSearchQuery(e.value)
  }
}

const createView = function() {
  const self = this
  return m('div', { class: classNames(fullWidth, fullHeight, above, 'search') }, [
    m('div#serch-container', { config: fadeIn }, [
      m.component(search, {
        type: 'fullwidth',
        textfield: {
          label: 'Search',
          getState: searchHandler.bind(self),
          value: () => self.state.data.query(),
          autofocus: true
        },
        // config: ( el, init, context, virtual) => {
        //   console.log('MYYYYYY CONFIIIG')
        //   if ( !init ) {
        //     // console.log(el.querySelector('input').value)
        //     StationsStore.addChangeListener(self._onQueryChange.bind(virtual))
        //   }
        // },
        // events: {
        //   onfocus: searchHandler.bind(self),
        //   oninput: searchHandler.bind(self),
        //   onactive: searchHandler.bind(self)
        // },
        buttons: {
          none: {
            before: btnClear,
            after: btnForward.call(this)
          },
          focus: {
            before: btnClear,
            after: btnForward.call(this)
          },
          focus_dirty: {
            before: btnClear,
            after: btnForward.call(this)
          },
          dirty: {
            before: btnClear,
            after: btnForward.call(this)
          }
        }
      })
      // stationResultsMenu()
    ])
  ])
}

const SearchToolbarComponent = {

  state: {
    data: {
      query: m.prop(''),
      resultsPresent: m.prop(false),
      validStation: m.prop(false)
    }
  },

  _onQueryChange() {
    StationsStore.getQuery()
      .then(setState.bind(SearchToolbarComponent))
  },

  controller(data) {
    this.onunload = function() {
      SearchToolbarComponent._onQueryChange()
      StationsStore.removeChangeListener(SearchToolbarComponent._onQueryChange)
    }
  },

  view(ctrl) {
    return createView.call(this)
  }
}

StationsStore.addChangeListener(SearchToolbarComponent._onQueryChange)

export default SearchToolbarComponent

