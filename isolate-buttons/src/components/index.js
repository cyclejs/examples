import Rx from 'rx';
import {h, div, h1, h2, button, p} from '@cycle/dom'
import isolate from '@cycle/isolate'
import isolateButton from './isolate-button'


function view (state$) {
  return state$.map(buttonView);
}

function buttonView ({buttons, colour}) {
  return (
    div('.buttons', [
      h1([`Isolate Buttons`]),
      buttons.map(buttons => buttons.DOM)
    ])
  );
}

const model = () => {
  // ???
}

const main = (sources) => {
  const props$ = sources.Props 
  const isolateButton$ = isolate(isolateButton)(/*???*/)
  const state$ = model({...actions, props$});

  return {
    DOM: view(state$, isolateButton$),
    Props: state$,
  }
};

export default main
