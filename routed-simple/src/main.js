import {run} from '@cycle/core'
import {makeDOMDriver, div} from '@cycle/dom'
import Rx from 'rx'

import navbar from './dialogue/navbar'
import content from './dialogue/content'

//
const view = (navbar, content) => {
  return div('.main',[
    div('.nav', [navbar]),
    div('.content', [content])
  ])
}

const main = responses => {
  const Content = content(responses)
  const Nav = navbar(responses)

  const view$ = Rx.Observable.just(
    view(
      Nav.DOM,
      Content.DOM
    )
  )

  return {
    DOM: view$,
    History: Nav.url$,
  }
}

export default main
