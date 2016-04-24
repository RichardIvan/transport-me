'use strict'

//libraries
import Bullet from 'bullet-pubsub'

//stores
import Store from './store.js'
import JourneyStore from './stores/journey-store.js'
import HeaderStore from './stores/header-store.js'
import StationsStore from './stores/stations-store.js'

// register + call back 

// yt video, 9:40
// this callback has a switch statement there 
// where the store decides by the action in the payload what it needs to do

// export default function(payload) {
//   Bullet.trigger(payload.action, payload)
// }

export default function (payload) {
  Store.dispatchIndex(payload)
  JourneyStore.dispatchIndex(payload)
  HeaderStore.dispatchIndex(payload)
  StationsStore.dispatchIndex(payload)
}
