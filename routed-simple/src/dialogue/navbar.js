import {h, div, ul, li, a} from '@cycle/dom'
import latestObj from 'rx-combine-latest-obj'
import {filterLinks} from '@cycle/history'
import {getUrl, extractValue, events} from '../utils/utils'

const intent = ({DOM}) => ({
  click$: events(
    DOM.select('.link'), [
      `click`,
      `touchstart`,
    ])
    .filter(filterLinks),
})

const model = ({click$}, {History}) => {
  return latestObj({
    url: click$
      .map(getUrl)
      .startWith(History.value.pathname),
  })
}

const view = () => {
  return div([
    ul('.menu', [
      li('.link', [
        a({href: `/`}, [`Home`])
      ]),
      li('.link', [
        a({href: `/page1`}, [`Page 1`])
      ]),
      li('.link', [
        a({href: `/page2`}, [`Page 2`])
      ])
    ])
  ])
}

const navbar = (responses) => {
  const actions = intent(responses)
  const state$ = model(actions, responses)
  const view$ = view()

  return {
    DOM: view$,
    url$: extractValue(`url`, state$),
  }
}

export default navbar
export {navbar}
