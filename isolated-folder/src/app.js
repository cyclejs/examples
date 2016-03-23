import {Subject} from 'rx'
import {run} from '@cycle/core'
import {makeDOMDriver} from 'cycle-snabbdom'

import {createFolder} from './Folder'

function main(sources) {
  const Folder = createFolder({id: '0', removable: false})
  const proxyAction$ = new Subject()
  const folder = Folder({action$: proxyAction$, ...sources})
  const {action$, remove$} = folder
  action$.takeUntil(remove$).subscribe(proxyAction$.asObserver())
  return folder
}

run(main, {DOM: makeDOMDriver('#app')})
