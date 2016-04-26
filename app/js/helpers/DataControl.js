import _ from 'lodash'
import CacheControl from '../helpers/CacheControl.js'

const DataControl = (function() {

  let that = this
  
  const privateVar = 'something'
  let url = new URL('http://localhost:3000')
  // const fullUrl = `${url.origin}/raw`

  // console.log(fullUrl)

  const findRoutes = function(routes, origin, destination, dayType) {
    if (dayType === 'WKDY') {
      dayType = 'FRI'
    }
    return routes[origin][destination][dayType]
  }

  const getLineToParse = function( stops, line, dayType ) {
    return stops[line][dayType]
  }

  const findStopsByLine = function( stops, origin, destination, dayType, time) {

  }

  // const dataTransform = function() {
  //   console.log('TRANSFORMING DATA')
  //   return Promise.all(loadData('/raw/stops'), loadData('/raw/trips'))
  //     .then(data => {
  //       const { stops, trips } = data
  //       // console.log(stops)
  //       // console.log(trips)
  //       const tripObject = {}

  //       const groupedStops = _.groupBy(stops, (stop) => stop[0])

  //       const group = _.groupBy(trips, (stop) => stop[6])
  //       // const groupKeys = Object.keys(group)
  //       _.forEach(group, (arrayOfLinesByLineName) => {

  //         const groupByDay = _.groupBy(arrayOfLinesByLineName, (line) => line[1])

  //         _.forEach(groupByDay, (routes) => {
  //           _.forEach(routes, (routeInfo) => {
  //             const lineNumber = routeInfo[6].substr(0, 2)
  //             const lineDay = routeInfo[1]
  //             const lineKey = routeInfo[2]
  //             if (tripObject[lineNumber] || (tripObject[lineNumber] = {}));
  //             if ( _.isArray(tripObject[lineNumber][lineDay]) || (tripObject[lineNumber][lineDay] = [] )) {
  //               tripObject[lineNumber][lineDay].push(groupedStops[lineKey])
  //             }
  //           })
  //         })
  //       })

  //       return tripObject
  //     })
  // }

  let compareTime = function( comparisonType, stationTime, timeByUser) {

    timeByUser = timeByUser.split(":")
    stationTime = stationTime.split(':').join('')

    let timeByUserHour = parseInt(timeByUser[0])

    if (timeByUserHour >= 0 && timeByUserHour <= 2) {
      timeByUserHour = '' + (24 + timeByUserHour)
      timeByUser[0] = timeByUserHour
      timeByUser = timeByUser.join('')
    } else timeByUser = timeByUser.join('')

    if ( comparisonType === 'gt' ) {
      return parseInt(stationTime, 10) >= parseInt(timeByUser, 10)
    } else {
      return parseInt(stationTime, 10) <= parseInt(timeByUser, 10) 
    }

  }

  const _object = {
    transformData: function( event ) {
      console.log( event )
      // const transformedData = dataTransform()
      dataTransform().then(data => {
        console.log(data)
        const response = new Response(transformedData, {
          ok: true,
          status: 200,
          url: event.request.url
        })
        console.log(response)
        // return CacheControl.putIntoCache( event, response )
      })
    },
    getRoute: function( event, pathnameInfo ) {
      // console.log(this)

      console.log(event)
      console.log(pathnameInfo)

      const dataRequest = new Request('data/')
      const routesRequest = new Request('routes/')
      const requests = [dataRequest, routesRequest]

      const promises = _.map(requests, (request) => {
        return caches.match(request)
          .then((response) => response.json())
      })
      // DataControl.transformData.bind(event)
      // console.log(_object)
      
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

          let possibleRoutes = findRoutes( routes, origin, destination, day)
          console.log(possibleRoutes)
          const constructFullTime = function( oldTime ) {
            return [oldTime.substr(0, 2), oldTime.substr(2, 2), '00'].join(':')
          }
          const fullTimeString = constructFullTime(time)
          // console.log(fullTimeString)

          let firstCollection = _.reduce(possibleRoutes, (result, route, iii) => {

            // console.log(route)
            // console.log(route.length)
            let secondCollection = _.reduce(route, (res, part, indx) => {
              // console.log('PRINTED RES')
              // console.log(indx)
              // console.log(res)
              // console.log('PRINTED RES')
              if ( !indx ) {

                let lineNumber = part.line
                let partOrigin = part.origin
                let partDestination = part.destination

                let lineInfo = getLineToParse(data, lineNumber, day)


                let possibleFirstParts = []
                _.each(lineInfo, (line, index, arrray) => {
                  // we return true here if the origin station is on this route and also this origin station is within the timeframe and also the destination station is present
                  let returnTrue = function() {
                    return true;
                  }
                  
                  _.forEach(line, (stop, parsedStationIndex, array) => {
                    // console.log(stop[3])
                    if ( stop[3].startsWith(partOrigin) ) {

                      let departureTime = stop[1]
                      let min = fullTimeString
                      let max = fullTimeString.split(':')
                      let hr = parseInt(max[0], 10) + 1
                      hr = ( hr.toString().length === 1 ) ? '0' + hr : hr
                      // console.log(hr)
                      max[0] = hr
                      max = max.join(':')
                      // console.log( max )
                      if ( compareTime( 'gt', departureTime, min ) && compareTime( 'lt', departureTime, max ) ) {

                        _.eachRight( line, (p, ix ) => {
                          
                          if ( ix > parsedStationIndex ) {
                            // we are filtering the transfers here too
                            // console.log('filtering destination');
                            if ( p[3] === partDestination ) {
                              let slimmedLine = _.cloneDeep(line)
                              slimmedLine = _(slimmedLine).drop(parsedStationIndex).dropRight(line.length - ix - 1 ).value()
                              // console.log(slimmedLine)
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
                // res.push(possibleFirstParts)
                return res

              }
              else {

                // console.log('SHOULD BE HERE NOW')

                // console.log('hey')
                let currPartIndex = indx
                let previousPartIndex = currPartIndex - 1
                // console.log('thisisres')
                // console.log(res)
                let previousPartDepartureTimes = _.map(res, part => {
                  return _.last(part[previousPartIndex])[1]
                })

                // console.log(previousPartDepartureTimes)

                _.forEach(previousPartDepartureTimes, (time, partialIndex) => {

                  let lineNumber = part.line
                  let partOrigin = part.origin
                  let partDestination = part.destination

                  let lineInfo = getLineToParse(data, lineNumber, day)

                  let possibleNextPart = []
                  _.each(lineInfo, (line, index, arrray) => {
                    // we return true here if the origin station is on this route and also this origin station is within the timeframe and also the destination station is present
                    // let returnTrue = function() {
                    //   return true;
                    // }
                    
                    _.forEach(line, (stop, parsedStationIndex, array) => {
                      // console.log(stop[3])
                      if ( stop[3].startsWith(partOrigin) ) {

                        let departureTime = stop[1]
                        let min = time
                        let max = time.split(':')
                        let hr = parseInt(max[0], 10) + 1
                        hr = ( hr.toString().length === 1 ) ? '0' + hr : hr
                        // console.log(hr)
                        max[0] = hr
                        max = max.join(':')
                        // console.log( max )
                        if ( compareTime( 'gt', departureTime, min ) && compareTime( 'lt', departureTime, max ) ) {

                          _.eachRight( line, (p, ix ) => {
                            
                            if ( ix > parsedStationIndex ) {
                              // we are filtering the transfers here too
                              // console.log('filtering destination');
                              if ( p[3] === partDestination ) {
                                let slimmedLine = _.cloneDeep(line)
                                slimmedLine = _(slimmedLine).drop(parsedStationIndex).dropRight(line.length - ix - 1 ).value()
                                // console.log(slimmedLine)
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

                  possibleNextPart.sort(function(a, b) {
                    let aTime = _.last(a)[1]
                    let bTime = _.last(b)[1]

                    // console.log('aTime')
                    // console.log(aTime)
                    // console.log('bTime')
                    // console.log(bTime)
                    if ( aTime < bTime ) {
                      return -1
                    } else if ( aTime > bTime ) {
                      return 1
                    } else return 0
                  })
                  // console.log(possibleNextPart)
                  // console.log(res[currPartIndex])
                  // console.log(possibleNextPart[0])
                  // console.log(possibleNextPart)
                  if( _.isEmpty(possibleNextPart) ) {
                    res[partialIndex] = []
                  } else {
                    res[partialIndex].push(possibleNextPart[0])
                  }
                  // _.map(possibleNextPart, (route) => {
                  //   console.log(part[previousPartIndex])
                  //   console.log(_.last(route)[1])
                  // })

                })

                // _.forEach(partOneDepartures, var => function, [thisArg])

                


              }

              


              // console.log(possibleFirstParts)
              // console.log(res)
              return res


            }, [])
            // array of first parts

            // console.log(secondCollection)
            result.push(secondCollection)
            return result

          }, [])

          // console.log(firstCollection
          let finalArray = _.filter(_.flatten(firstCollection), array => {
            return (!_.isEmpty(array) ) ? 1 : 0
          })
          console.log(finalArray)

          return JSON.stringify(finalArray)
          // console.log(_.compact())
          // let finalResponse = _.flatten(firstCollection)
          // return finalResponse
          // console.log(possibleRoutes)
          // console.log(data)
          // console.log(routes)
        })
      
    },
    getData: function() {
      url.pathname = 'data'
      const loc = url.href
      console.log(loc)
      console.log(loc)
      console.log(loc)
      console.log(loc)
      fetch('http://localhost:3000/data/')
        .then(d => {
          console.log(d)
          return d
        })
        .catch(err => console.log(err))
    }

  }
  return _object
})()

export default DataControl
