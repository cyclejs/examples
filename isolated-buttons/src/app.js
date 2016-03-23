import {Subject} from 'rx'
import {run} from '@cycle/core'
import {makeDOMDriver} from 'cycle-snabbdom'

import {createButton} from './Button'

function main(sources) {
  const Button = createButton({id: '0', removable: false})
  const proxyAction$ = new Subject()
  const button = Button({action$: proxyAction$, ...sources})
  const {action$, remove$} = button
  action$.takeUntil(remove$).subscribe(proxyAction$.asObserver())
  return button
}

run(main, {DOM: makeDOMDriver('#app')})
