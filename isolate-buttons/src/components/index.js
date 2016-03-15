import Rx from 'rx';
import {h, div, h1, h2, button, p} from '@cycle/dom'
import isolate from '@cycle/isolate'
import isolateButton from './isolate-button'

const view = (state$) =>
  state$.map(state =>
    div('.homepage', [
      h1([`Isolate Buttons`]),
      div([
        div([state.map((b) => {
          return div({style: {'background': 'lightgrey', 'margin': '15px', 'padding': '10px', 'width': '25%', 'float': 'left'}},[
            button('.button', {style: {'padding': '5px', 'margin': '5px'}}, 'Add New | ' + b),
            button('.delete', {style: {'padding': '5px', 'margin': '5px', 'float': 'right'}}, 'delete')
          ])
          // return div([isolate(isolateButton)(b)])
        })
        ])
      ])
    ])
  );

const intent = s => ({
  inc$: s.DOM.select('.button').events('click').map(ev => 1),
});

const model = ({inc$, props$}) => {
  return Rx.Observable.merge(
    props$.take(1).map((count) => count),
    inc$,
    )
    .scan((x, y) => x.concat([y]))
    .shareReplay(1)
}

const main = (sources) => {
  const props$ = sources.Props;
  const actions = intent(sources);
  const state$ = model({...actions,props$});

  return {
    DOM: view(state$),
    Props: state$,
  }
};

export default main
