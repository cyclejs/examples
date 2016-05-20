import {Observable} from 'rx';
import Cycle from '@cycle/core';
import {h1, div, h, makeDOMDriver} from '@cycle/dom';

function intent(DOM) {
  return {
    scrollWindow$: DOM.select('.scroll-table').events('scroll').
      map((e) => e.target.scrollTop)
  };
}

function model(actions) {
  return Observable.combineLatest(
    actions.scrollWindow$.startWith(0)
  );
}

function view(state$) {
  return state$.
    map((scrollTop) =>
      div([
        h1('scrollTop = ' + scrollTop),
        div('.scroll-table', [
          h1('.filler', 'FILLER')
        ])
      ])
    );
}

function main({DOM}) {
  const actions = intent(DOM);
  const state$ = model(actions);

  return {
    DOM: view(state$)
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#main-container')
});
