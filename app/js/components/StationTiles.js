'use strict'

//libraries
import m from 'mithril'
import _ from 'lodash'
import classNames from 'classnames'

//poly components
import listTile from 'polythene/list-tile/list-tile'
import icon from 'polythene/icon/icon'
import radioIcon from 'mmsvg/google/msvg/notification/wifi'

//helpers
import ColorConstants from '../helpers/color-constants.js'

//styles
import styles from '../../css/app.scss'
import LineStyles from '../../css/line-number-colors.scss'

const renderIcon = (realtime) => {
  console.log("REALTIME ICOOOON")
  console.log(realtime)
  return m.component(icon, {
    class: classNames(styles.icon, realtime ? styles.active : ''),
    msvg: radioIcon
  })
}

const createList = (station) => {
  return m('ul', [
      m('li', { class: classNames(styles.inlineList) }, station[1]),
      m('li', { class: classNames(styles.inlineList, styles.right) }, station[3])
    ])
}

const compactPart = function(stations) {
  const first = _.first(stations)
  const last = _.last(stations)

  const array = [
    createList(first),
    createList(last)
  ]
  return array
}

const fullPart = (stations) => {
  return  _.map(stations, (station) => {
            // console.log(station)
            return createList(station)
          })
}

export default function(stations, compact, realtime) {
  const className = LineStyles[ColorConstants[stations[0][6]]]
  return m.component(listTile, {
    // class: className,
    title: 'fucking hell',
    content: [
      m(`.${className}`),
      compact ? compactPart(stations) : fullPart(stations),
      renderIcon(realtime)
    ]
  })
  // return m.component(listTile, {
  //   class: className,
  //   content: [
  //     compact ? compactPart(stations) : fullPart(stations)
  //   ]
  // })
}
