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
  const listHeight$ = Observable.just(500);
  const itemHeight$ = Observable.just(200);
  const totalItems$ = Observable.just(1000);
  const scrollTop$ = actions.scrollWindow$.startWith(0);
  const items$ = Observable.just([{ id: 1 }, { id: 2 }, { id: 3 }]);

  return Observable.combineLatest(
    listHeight$,
    itemHeight$,
    totalItems$,
    scrollTop$,
    items$
  );
}

function renderItems(items, itemHeight) {
  return items.map((item) => renderItem(item, itemHeight));
}

function renderItem(item, itemHeight) {
  const vtree$ =
    div(
      '.item',
      {
        style: { height: itemHeight + 'px', background: 'red' }
      },
      h1("Item " + item.id)
    );

  return vtree$;
}

function view(state$) {
  return state$.
    map(([listHeight, itemHeight, totalItems, scrollTop, items]) =>
      div('.scroll-table', {
          style: { height: listHeight + 'px', overflow: "auto" }
        },
        div('.items', renderItems(items, itemHeight))
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
