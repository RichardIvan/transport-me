'use strict'

import _ from 'lodash'
import CacheControl from './CacheControl.js'
import NetworkControl from './NetworkControl.js'

const DataControl = (function() {
  const findRoutes = function(routes, origin, destination, dayType) {
    if (dayType === 'WKDY') {
      dayType = 'FRI'
    }
    return routes[origin][destination][dayType]
  }

  const getLineToParse = function(stops, line, dayType) {
    return stops[line][dayType]
  }

  const compareTime = function( comparisonType, st, tbu) {
    let timeByUser = tbu.split(":")
    const stationTime = st.split(':').join('')

    let timeByUserHour = parseInt(timeByUser[0], 10)

    if (timeByUserHour >= 0 && timeByUserHour <= 2) {
      timeByUserHour = `${24 + timeByUserHour}`
      timeByUser[0] = timeByUserHour
      timeByUser = timeByUser.join('')
    } else timeByUser = timeByUser.join('')

    if (comparisonType === 'gt') {
      return parseInt(stationTime, 10) >= parseInt(timeByUser, 10)
    } else {
      return parseInt(stationTime, 10) <= parseInt(timeByUser, 10) 
    }
  }

  const _object = {
    getRoute(event, pathnameInfo) {
      const dataRequest = new Request('data/')
      const routesRequest = new Request('routes/')
      const requests = [dataRequest, routesRequest]

      console.log(dataRequest)
      console.log(routesRequest)

      const promises = _.map(requests, (request) => {
        //fetch the endpoints here
        console.log('REQUESTING DATA AND ROUTES VIA CACHECONTROL')
        return CacheControl.getFromCache(request, NetworkControl.fetchFromNetwork.bind(null, request)).then((response) => response.json())
        // return fetch(request).then((response) => response.json())
        // return caches.match(request)
        //   .then((response) => response.json())
      })

      return Promise.all(promises)
        .then((results) => {
          console.log(results)
          const [data, routes] = results
          const { endpoint, origin, destination, searchBy, day, time } = pathnameInfo

          console.log('results')
          console.log(endpoint)
          console.log(origin)
          console.log(destination)
          console.log(searchBy)
          console.log(day)
          console.log(time)

          const possibleRoutes = findRoutes(routes, origin, destination, day)
          console.log(possibleRoutes)
          const constructFullTime = function(oldTime) {
            return [oldTime.substr(0, 2), oldTime.substr(2, 2), '00'].join(':')
          }
          const fullTimeString = constructFullTime(time)

          const firstCollection = _.reduce(possibleRoutes, (result, route) => {
            const secondCollection = _.reduce(route, (res, part, indx) => {
              if (!indx) {
                const lineNumber = part.line
                const partOrigin = part.origin
                const partDestination = part.destination
                const lineInfo = getLineToParse(data, lineNumber, day)

                _.each(lineInfo, (line) => {
                  _.forEach(line, (stop, parsedStationIndex) => {
                    if (stop[3].startsWith(partOrigin)) {
                      const departureTime = stop[1]
                      const min = fullTimeString
                      let max = fullTimeString.split(':')
                      let hr = parseInt(max[0], 10) + 1
                      hr = ( hr.toString().length === 1 ) ? '0' + hr : hr
                      max[0] = hr
                      max = max.join(':')
                      if (compareTime('gt', departureTime, min) && compareTime('lt', departureTime, max)) {
                        _.eachRight(line, (p, ix) => {
                          if (ix > parsedStationIndex) {
                            if (p[3].startsWith(partDestination)) {
                              let slimmedLine = _.cloneDeep(line)
                              slimmedLine = _(slimmedLine).drop(parsedStationIndex).dropRight(line.length - ix - 1).value()
                              _.forEach(slimmedLine, (s) => {
                                s[6] = lineNumber
                              })
                              res.push([slimmedLine])
                            }
                          } else {
                            return false
                          }
                        })
                      }
                    }
                  })
                })
                return res
              }
              else {
                const currPartIndex = indx
                const previousPartIndex = currPartIndex - 1
                const previousPartDepartureTimes = _.map(res, (part) => _.last(part[previousPartIndex])[1])

                _.forEach(previousPartDepartureTimes, (time, partialIndex) => {
                  const lineNumber = part.line
                  const partOrigin = part.origin
                  const partDestination = part.destination

                  const lineInfo = getLineToParse(data, lineNumber, day)

                  const possibleNextPart = []
                  _.each(lineInfo, (line, index) => {
                    _.forEach(line, (stop, parsedStationIndex) => {
                      // console.log(stop[3])
                      // console.log(partOrigin)
                      if (stop[3].startsWith(partOrigin)) {
                        const departureTime = stop[1]
                        const min = time
                        let max = time.split(':')
                        let hr = parseInt(max[0], 10) + 1
                        hr = (hr.toString().length === 1) ? `0${hr}` : hr
                        max[0] = hr
                        max = max.join(':')
                        if (compareTime('gt', departureTime, min) && compareTime('lt', departureTime, max)) {
                          _.eachRight(line, (p, ix) => {
                            if (ix > parsedStationIndex) {
                              if (p[3].startsWith(partDestination)) {
                                let slimmedLine = _.cloneDeep(line)
                                slimmedLine = _(slimmedLine).drop(parsedStationIndex).dropRight(line.length - ix - 1).value()
                                _.forEach(slimmedLine, (s) => {
                                  s[6] = lineNumber
                                })
                                possibleNextPart.push(slimmedLine)
                              }
                            } else {
                              return false
                            }
                          })
                        }
                      }
                    })
                  })

                  possibleNextPart.sort((a, b) => {
                    const aTime = _.last(a)[1]
                    const bTime = _.last(b)[1]

                    if (aTime < bTime) {
                      return -1
                    } else if (aTime > bTime) {
                      return 1
                    } else return 0
                  })
                  if(_.isEmpty(possibleNextPart)) {
                    res[partialIndex] = []
                  } else {
                    res[partialIndex].push(possibleNextPart[0])
                  }
                })
              }
              return res
            }, [])
            result.push(secondCollection)
            return result
          }, [])
          const finalArray = _.filter(_.flatten(firstCollection), (array) => (!_.isEmpty(array)) ? 1 : 0)
          return JSON.stringify(finalArray)
        })
    }
  }
  return _object
})()

export default DataControl
