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

  event.waitUntil(

    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/css/main.css',
        '/js/index.js',
        '/?/',
        '/?/index.html',
        '/?/css/main.css',
        '/?/js/index.js',
        '/stations/'
      ]).then((a) => {
        // console.log(window)
        const endpoints = ['data/', 'routes/']

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
  // console.log('yeah waiting man')
})

self.addEventListener('redundant', (event) => {
  // console.log(event)
  // console.log('yeah waiting')
})

self.addEventListener('activate', (event) => {
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

  const url = event.request.url
  const dataFromURL = parseURL(url)

  const endpoint = dataFromURL.endpoint

  console.log('ENDPOINT IN SW')
  console.log(endpoint)

  switch (endpoint) {
    case 'data':
      // getFromCache accepts event / event.request and callbackFunction in case there is no data in in the cache
      event.respondWith(
        CacheControl.getFromCache(event, NetworkControl.fetchFromNetwork.bind(null, event))
        )
      break
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
    default:
      event.respondWith(CacheControl.getFromCache(event))
      break
  }

  // CacheControl.isCacheable(pathname, event)

  // if (  ) {
  //   console.log('yes it is cacheable')
  //   // CacheControl.get(event)
  // }
  

  // switch (pathname) {
  //   case '/js/index.js':
  //     event.respondWith(

  //       caches.match(event.request).then((response) => {
  //         if (response) {
  //           console.log('Found response in cache:', response)
  //           return response
  //         }
  //         console.log('No response found in cache. About to fetch from network...')

  //         return fetch(event.request).then((res) => {
  //           console.log('Response from network is:', res)
  //           return caches.open(staticCacheName).then((cache) => {
  //             console.log('Putting response in in Cache')
  //             cache.put(event.request, res.clone())
  //             return res
  //           })

  //           // return response;
  //         }).catch((error) => {
  //           console.error('Fetching failed:', error)
  //           throw error
  //         })

  //       })

  //     )
  //     break


  // }

  // const end = now()
  // const duration = (start - end).toFixed(3) * -1
  // console.log(`${duration} ms`)

  // console.log(url)
  // console.log(url.host)
  // console.log(url.pathname)

  // if (url.host === 'localhost:3000' && url.pathname === '/stations') {
  //   console.log('Handling fetch event for', event.request.url)

    // console.log( 'we are trying to get content from cache' )
    // event.respondWith(
    //   caches.match(event.request).catch(() => {
    //     console.log( 'dont have match in cache' )
    //     return fetch(event.request).then((response) => {
    //       console.log( 'successful fetch over the network' )
    //       return caches.open('v1').then((cache) => {
    //         console.log( 'ive sucessfully put in in cache' )
    //         cache.put(event.request, response.clone())
    //         return response;
    //       })
    //     })
    //   }).catch(() => {
    //     console.log('this is some sort of brutal error')
    //     return caches.match('/sw-test/gallery/myLittleVader.jpg')
    //   })
    // )
  // }

  // console.log(event)
  // event.respondWith(
  //   caches.match(event.request);
  // );
})
