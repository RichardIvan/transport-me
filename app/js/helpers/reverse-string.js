'use strict'

export default function() {
  const str = this.message()
  let temp = ''
  let i = str.length

  while (i > 0) {
    temp += str.substring(i - 1, i)
    i--
  }

  this.message(temp)
}
