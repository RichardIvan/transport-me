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

  return m('ul', { style: { listStyle: 'none', padding: '0px' } }, [
    m('li', { style: { marginTop: '1em', marginBottom: '1em' } }, createList(first)),
    m('li', { style: { marginTop: '1em', marginBottom: '1em' } }, createList(last))
  ])
  // const array = [
  //   createList(first),
  //   createList(last)
  // ]
  // return array
}

const fullPart = (stations) => {
  return m('ul', { style: { listStyle: 'none', padding: '0px' } }, [
      _.map(stations, (station) => {
            // console.log(station)
            return m('li', { style: { marginTop: '1em', marginBottom: '1em' } }, createList(station))
          })
    ]) 
}

export default function(stations, compact, realtime, duration) {
  const lineNumber = stations[0][6]
  const className = LineStyles[ColorConstants[lineNumber]]
  return m.component(listTile, {
    // class: className,
    content: [
      // m(`.${className}`),
      m('div', m(`ul.${styles['line-info']}`, [
        m('li', `Line: ${lineNumber}`),
        m('li', { class: styles['li-right'] }, `Duration: ${duration} ${duration == 1 ? 'minute' : 'minutes'}`),
        m('li', renderIcon(realtime)) 
      ])),
      m(`.${styles['li-content']}`, [
        m(`.${className}`),
        compact ? compactPart(stations) : fullPart(stations)
      ]),
    ]
  })
  // return m.component(listTile, {
  //   class: className,
  //   content: [
  //     compact ? compactPart(stations) : fullPart(stations)
  //   ]
  // })
}
