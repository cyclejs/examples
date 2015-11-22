import {div, h1, h} from '@cycle/dom'
import Home from '../dialogue/pages/home'
import Page1 from '../dialogue/pages/page1'
import Page2 from '../dialogue/pages/page2'

const routes = {
  '/': div('.home', Home().DOM),
  '/page1': div('.Page1',Page1().DOM),
  '/page2': div('.Page2',Page2().DOM),
  '*': h1(`Page could not be found`),
}

export default routes
