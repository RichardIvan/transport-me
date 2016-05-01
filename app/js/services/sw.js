'use strict'

const registerServiceWorker = require('serviceworker!./workers/serviceWorker.js')

class Sw {
  constructor(scope) {
    this.scope = '/'
  }
  register (scope) {
    registerServiceWorker().then((registration) => {
      // console.log(registration)
      let serviceWorker
      if (registration.installing) {
        serviceWorker = registration.installing
        // console.log('service worker is installing')
      } else if (registration.waiting) {
        serviceWorker = registration.waiting
        // console.log('service worker is waiting')
      } else if (registration.active) {
        serviceWorker = registration.active
        // console.log('service worker is active')
      }
      if (serviceWorker) {
        serviceWorker.addEventListener('statechange', (e) => {
          // console.log('service worker status:', e.target.state)
        })
      }
    }).catch((error) => {
    // Something went wrong during registration. The service-worker.js file
      // might be unavailable or contain a syntax error.
      console.log('error')
      console.log(error)
    })
  }
}

export default Sw
