'use strict'

// libraries
import m from 'mithril';
import Velocity from 'velocity-animate'

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

const handleForwardClick = function(e) {
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

const btnForward = function() {
  return m.component(iconButton, {
    class: forwardBtn,
    icon: {
      msvg: iconForward
    },
    // raised: state.validStation()
    events: {
      onclick: handleForwardClick
    }
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
  return m('div', { class: classNames(fullWidth, fullHeight, above) }, [
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
            after: btnForward()
          },
          focus: {
            before: btnClear,
            after: btnForward()
          },
          focus_dirty: {
            before: btnClear,
            after: btnForward()
          },
          dirty: {
            before: btnClear,
            after: btnForward()
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
      resultsPresent: m.prop(false)
    }
  },

  _onQueryChange() {
    StationsStore.getQuery()
      .then(setState.bind(SearchToolbarComponent))
  },

  _onInit() {
    console.log('initial data')
  },

  controller(data) {
    this.onunload = function() {
      // console.log('REMOVING THE LISTENER')
      // console.log('REMOVING THE LISTENER')
      // console.log('REMOVING THE LISTENER')
      // console.log('REMOVING THE LISTENER')
      // console.log('REMOVING THE LISTENER')
      // console.log('REMOVING THE LISTENER')
      // SearchToolbarComponent.state.data.query = m.prop('')
      SearchToolbarComponent._onQueryChange()
      StationsStore.removeChangeListener(SearchToolbarComponent._onQueryChange)
      // Store.removeChangeListener(StationResultsMenu._onChange)
      // DataStore.removeChangeListener(StationResultsMenu._onInitialData)
      // Bullet.off('HEADER_RIPPLE')
      // Store.removeChangeListener(App.controller)
    },
    this.getIt = function() {
      console.log('yo')
    }
  },

  view(ctrl) {
    return createView.call(this)
  }

}

console.log(SearchToolbarComponent._onQueryChange)

StationsStore.addChangeListener(SearchToolbarComponent._onQueryChange)

export default SearchToolbarComponent

