'use strict'

//libraries
import m from 'mithril'
import _ from 'lodash'
import Bullet from 'bullet-pubsub'

//utilities
import Actions from '../../actions.js'

//poly components
import polyButtonComponent from 'polythene/button/button'
import icon from 'polythene/icon/icon';

import gToIcon from 'mmsvg/google/msvg/content/forward'

const handleRippleStart = function(e) {
  Bullet.trigger('HEADER_RIPPLE', e)
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

const originId = 'origin'
const destinationId = 'destination'

let origin
let destination

export default function() {

  if (!_.isEmpty(this.state.data.journeyPlanner())) {
    if (this.state.data.journeyPlanner().origin) {
      origin = this.state.data.journeyPlanner().origin.stationName[0]
    }
    if (this.state.data.journeyPlanner().destination) {
      destination = this.state.data.journeyPlanner().destination.stationName[0]
    }
  }

  return [m('div.flex.two.tall', { style: { paddingLeft: '20px' } }, [
      txtBtn( origin || 'Origin', originId)
    ]),
    m.component(icon, { msvg: gToIcon, class: 'flex two' }),
    m('div.flex.three.tall', [
      txtBtn( destination || 'Destination', destinationId)
    ]),
    m('div#custom-ripple', {
      config: rippleHandler
    })]
}
