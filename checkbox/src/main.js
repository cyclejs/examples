import {run} from '@cycle/core';
import {div, input, p, makeDOMDriver} from '@cycle/dom';

const main = sources => ({
  DOM: sources.DOM.select('input').events('change')
    .map(ev => ev.target.checked)
    .startWith(false)
    .map(toggled =>
      div([
        input({type: 'checkbox'}), 'Toggle me',
        p(toggled ? 'ON' : 'off')
      ])
    )
});

run(main, {
  DOM: makeDOMDriver('#main-container')
});
