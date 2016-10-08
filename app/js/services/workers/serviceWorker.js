'use strict'

//TODO chace common.js

import _ from 'lodash'
import now from 'performance-now'

import CacheControl from '../../helpers/CacheControl.js'
import DataControl from '../../helpers/DataControl.js'
import NetworkControl from '../../helpers/NetworkControl.js'

import parseURL from '../../helpers/extract-pathname.js'

const staticCacheName = CacheControl.getCacheName()
// const CacheControl = new CC(staticCacheName)

self.addEventListener('install', (event) => {

  console.log(event)
  console.log(self)

  event.waitUntil(

    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        '/transport-me/',
        '/transport-me/index.html',
        '/transport-me/css/main.css',
        '/transport-me/js/index.js',
        '/transport-me/?/',
        '/transport-me/?/index.html',
        '/transport-me/?/css/main.css',
        '/transport-me/?/js/index.js',
        '/transport-me/stations/'
      ]).then((a) => {
        // console.log(window)
        const endpoints = ['transport-me/data/', 'transport-me/routes/']

        const promises = _.map(endpoints, (endpoint) => {
          const url = `${event.currentTarget.registration.scope}${endpoint}`

          return fetch(url).then((response) => {
            const dataRequest = new Request(endpoint)

            return cache.put(dataRequest, response)
          })
        })

        return Promise.all(promises)

      }).catch((e) => console.log(e))
    })
    .then(() => {
      self.skipWaiting()
    })
  )
})

self.addEventListener('waiting', (event) => {
  console.log('yeah waiting man')
})

self.addEventListener('redundant', (event) => {
  console.log(event)
  console.log('yeah waiting')
})

self.addEventListener('activate', (event) => {

  console.log('have been activated')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('transport-') &&
                 cacheName !== staticCacheName
        }).map((cacheName) => {
          return caches.delete(cacheName)
        })
      )
      // .then(_ => console.log('thats not true, its only triggered after install, actually next time the client has let go of the previeous controlling worker!'))
    })
  )
})

self.addEventListener('fetch', (event) => {

  console.log(event)

  const url = event.request.url
  const dataFromURL = parseURL(url)

  const endpoint = dataFromURL.endpoint

  // console.log('ENDPOINT IN SW')
  // console.log(endpoint)

  switch (endpoint) {
    case 'data':
    case 'routes':
      // getFromCache accepts event / event.request and callbackFunction in case there is no data in in the cache
      event.respondWith(
        CacheControl.getFromCache(event, NetworkControl.fetchFromNetwork.bind(null, event))
        )
      break
    case 'journey':
      // let thingy = CacheControl.getFromCache(event, DataControl.getRoute.bind(null, event, pathnameInfo))
      // console.log()
      console.log(dataFromURL)

      event.respondWith(
        CacheControl.getFromCache(event, DataControl.getRoute.bind(null, event, dataFromURL))
          // .then(resp => {
          //   console.log(resp)
          //   return resp
          //   // let init = { 'status': 200, 'statusText': "OK"}
          //   // return new Response(resp, init)
          // })
      )
      // accepts callback that will construct the necessary response for the route
      // this function searches data by passed in route Info
      // return
      break
    case 'stations':
      event.respondWith(
        CacheControl.getFromCache(event, NetworkControl.fetchFromNetwork.bind(null, event))
      )
      break
    case 'realtime':
      event.respondWith(
        NetworkControl.fetchFromNetwork(event)
      )
      break
    case 'browser-sync':
    case 'sockjs-node':
      break
    default:
      event.respondWith(CacheControl.getFromCache(event, NetworkControl.fetchFromNetwork.bind(null, event)))
      // // event.respondWith(CacheControl.getFromCache(event, NetworkControl.fetchFromNetwork.bind(null, event)))
      // event.respondWith(CacheControl.getFromCache(event, NetworkControl.fetchFromNetwork.bind(null, event, false)))
      break
  }
})
