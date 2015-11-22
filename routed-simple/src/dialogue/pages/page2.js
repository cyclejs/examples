import Rx from 'rx'
import {h, div, h1,} from '@cycle/dom'


const view = () => {
  return div([
    h1([`This is now Page 2`])
  ])
}

const Page2 = () => {

  const view$ = Rx.Observable.just(view());
  return {
    DOM: view$
  }
}

export default Page2
