import Rx from 'rx'
import {h, div, h1,} from '@cycle/dom'


const view = () => {
  return h1([`This is Page 1`])
}

const Page1 = () => {
  return {
    DOM: Rx.Observable.just(view())
  }
}

export default Page1
export {Page1}
