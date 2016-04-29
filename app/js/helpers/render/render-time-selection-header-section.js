'use strict'

//libraries
import m from 'mithril'
import moment from 'moment'

//stores

//utilities
import Actions from '../../actions.js'

//poly components
import textfield from 'polythene/textfield/textfield'
// import snackbar from 'polythene/notification/snackbar'
// import button from 'polythene/button/button'

let loaded = false

const valueGetter = () => {
  if (!loaded) {
    loaded = true
    return moment().local().format('YYYY-MM-DDTHH:mm')
  }
}

export default function() {
  return [
    m('div.flex', { style: { paddingLeft: '20px' } }, [
      m('form', [
        m.component(textfield, {
          class: 'flex seven',
          type: 'datetime-local',
          autofocus: true,
          getState: (e) => {
            if (e.value) {
              Actions.setDepartureTime({ departureTime: e.value })
            } else {
              //show that the input for the timestring is invalid
             //  snackbar.show({
             //    containerSelector: '#snackbar',
             //    title: 'Invalid time or date',
             //    layout: 'vertical',
             //    action: m.component(button, {
             //      label: 'Dismiss',
             //      events: {
             //        onclick: () => {
             //          snackbar.hide();
             //          // dialog.show(actionDialog(snackbar));
             //        }
             //      }
             //    })
             //  })
            }
          },
          value: valueGetter,
          // validate: (value) => {
          //   console.log(value)
          // },
          // value: '2016-04-25T12:12',
          // events: {
          //   oninput: (e) => {
          //     console.log('oninput event')
          //     console.log(e)
          //   },
          //   onkeyup: (e) => {
          //     console.log('onkeyup event')
          //     console.log(e)
          //   }
          // },
          config: (el, inited, context) => {
            if (!inited) {
              context.onunload = () => {
                loaded = false
              }
            }
          }
        })
      ])
    ])
  ]
}
