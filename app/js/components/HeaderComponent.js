'use strict'

// libraries
import m from 'mithril'
import Bullet from 'bullet-pubsub'

import classNames from 'classnames'

// utilities
import Actions from '../actions.js'
import setState from '../helpers/set-state.js'

//stores
import HeaderStore from '../stores/header-store.js'
import StationsStore from '../stores/stations-store.js'

//components
import searchToolbarComponent from './SearchToolbarComponent.js'

import 'polythene/layout/theme/theme'

//Polythene componenets
import polyToolbar from 'polythene/toolbar/toolbar'
import polyButtonComponent from 'polythene/button/button'
import iconBtn from 'polythene/icon-button/icon-button'
import icon from 'polythene/icon/icon';

import gIconSchedule from 'mmsvg/google/msvg/action/schedule'
import gToIcon from 'mmsvg/google/msvg/content/forward'
import gGoIcon from 'mmsvg/google/msvg/content/send'

// import textfield from 'polythene/textfield/textfield'
// import btn from 'polythene/button/button'
import Velocity from 'velocity-animate'

import { full, tall, white } from '../../css/journey-planner.scss'
import '../../css/journey-planner.scss'

const btn = function(icn, cls) {
  return m.component(iconBtn, {
    class: cls,
    icon: {
      class: cls,
      msvg: icn
    }
  })
}

const handleRippleStart = function(e) {
  Bullet.trigger('HEADER_RIPPLE', e)
}

const txtBtn = function(text, ID) {
  return m.component(polyButtonComponent, {
    label: text,
    id: ID,
    // raised: true,
    // events: {
    //   onclick: handleClick
    // },
    ripple: {
      // constrained: false,
      start: handleRippleStart,
      initialOpacity: 0,
      // opacityDecayVelocity: 0.1
    }
  })
}

const rippleCallBack = function(event) {
  const element = document.getElementById('custom-ripple')

  element.style.height = 0
  element.style.width = 0
  element.style.top = `${event.clientY}px`
  element.style.left = `${event.clientX}px`
  element.style.display = 'block'
  const max = `${event.path[6].clientWidth * 2}px`

  Velocity(element, {
    height: max,
    width: max,
    // x: "-50%",
    // y: "-50%",
    // translateX: "-50%",
    // translateY: "-50%",
    tween: 1000
  }, {
    duration: 400,
    progress(elements, complete, remaining, start, tweenValue) {
      // console.log(elements[0])
      // console.log((complete * 100) + "%");
      // console.log(remaining + "ms remaining!");
      // console.log("The current tween value is " + tweenValue)
    },
    complete(elements) {
      const id = event.target.parentElement.parentElement.parentElement.id
      Actions.setSearchStatus({ searchActive: id })
    }
  })
  Velocity(element, {
    height: 0,
    width: 0
  }, {
    duration: 0,
    delay: 1000
  })
}

const rippleHandler = function(element, isInitialized) {
  if (!isInitialized) {
    const el = element
    // element.style.opacity = 0
    el.style.position = 'fixed'
    el.style.background = 'white'
    el.style.borderRadius = '50%'
    el.style.zIndex = 1000
    // Velocity(element, {opacity: 1})
    Velocity(element, {
      x: '-50%',
      y: '-50%',
      translateX: '-50%',
      translateY: '-50%'
    }, { duration: 0 })
    Bullet.on('HEADER_RIPPLE', rippleCallBack)
  }
}

const baseToolbar = function() {
  const originId = 'origin'
  const destinationId = 'destination'

  return m('div.layout.center-center', { class: classNames(full, tall) }, [
    btn(gIconSchedule, ''),
    m('div.flex.two.tall', { style: { paddingLeft: '20px' } }, [
      txtBtn('Origin', originId)
    ]),
    m.component(icon, { msvg: gToIcon, class: 'flex two' }),
    m('div.flex.three.tall', [
      txtBtn('Destination', destinationId)
    ]),
    btn(gGoIcon, ''),
    m('div#custom-ripple', {
      config: rippleHandler
    })
  ])
}

const toolbar = function() {
  const searchState = this.state.data.searchActive()
  return m('div', [
    !searchState ? m.component(polyToolbar, {
      content: baseToolbar()
    }) : m.component(polyToolbar, {
      content: searchToolbarComponent
    })
  ])
}

const HeaderComponent = {
  state: {
    data: {
      searchActive: m.prop(false)
    }
  },

  _onChange() {
    HeaderStore.getAll()
      .then(setState.bind(HeaderComponent))
  },

  controller(data) {
    this.onunload = function() {
      HeaderStore.removeChangeListener(HeaderComponent._onChange)
      Bullet.off('HEADER_RIPPLE')
    }
  },

  view(ctrl) {
    return toolbar.call(this)
  }
}

HeaderStore.addChangeListener(HeaderComponent._onChange)
// StationsStore.addChangeListener(HeaderComponent._onStationStoreChange)

export default HeaderComponent
