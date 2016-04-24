'use strict'

export default function (requestURL) {

  const url = new URL(requestURL)
  const pathname = url.pathname
  const pathnameInfo = pathname.split('/')

  pathnameInfo.shift()

  return {
    endpoint: pathnameInfo[0],
    origin: pathnameInfo[1],
    destination: pathnameInfo[2],
    searchBy: pathnameInfo[3],
    day: pathnameInfo[4],
    time: pathnameInfo[5]
  }
}
