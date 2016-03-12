import {run} from '@cycle/core';
import {Observable} from 'rx';
import {div, button, p, makeDOMDriver} from '@cycle/dom';

function main({DOM}) {
  let action$ = Observable.merge(
    DOM.select('.decrement').events('click').map(() => -1),
    DOM.select('.increment').events('click').map(() => +1)
  );
  let count$ = action$.startWith(0).scan((sum, x) => sum + x);
  return {
    DOM: count$.map(count =>
        div([
          button('.decrement', 'Decrement'),
          button('.increment', 'Increment'),
          p('Counter: ' + count)
        ])
      )
  };
}

run(main, {
  DOM: makeDOMDriver('#main-container')
});
