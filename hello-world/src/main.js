import {run} from '@cycle/core';
import {div, label, input, hr, h1, makeDOMDriver} from '@cycle/dom';

const main = sources => ({
  DOM: sources.DOM.select('.myinput').events('input')
    .map(ev => ev.target.value)
    .startWith('')
    .map(name =>
      div([
        label('Name:'),
        input('.myinput', {attributes: {type: 'text'}}),
        hr(),
        h1(`Hello ${name}`)
      ])
    )
});

run(main, {
  DOM: makeDOMDriver('#main-container')
});
