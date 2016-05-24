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
  const listHeight$ = Observable.just("500px");
  const itemHeight$ = Observable.just("200px");

  return Observable.combineLatest(
    listHeight$,
    itemHeight$
  );
}

function view(state$) {
  return state$.
    map(([listHeight, itemHeight]) =>
      div('.scroll-table', {
          style: { height: listHeight, overflow: "auto" }
        },
        div('.items', [
          div('.item', { style: { height: itemHeight, background: 'red' } }, h1("Item 1")),
          div('.item', { style: { height: itemHeight, background: 'red' } }, h1("Item 2")),
          div('.item', { style: { height: itemHeight, background: 'red' } }, h1("Item 3"))
        ])
      )
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
