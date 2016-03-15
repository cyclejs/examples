import {button} from '@cycle/dom'

const view = (state$) =>
  state$.map(state =>
    button('.button', {style: {'padding': '10px'}}, 'Click me to duplicate'),
  );


const isolateButton = (state$) => {
  return {
    DOM: view(state$),
    Props: state$,
  }
};

export default isolateButton
