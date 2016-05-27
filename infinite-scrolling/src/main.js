import {Observable} from 'rx';
import Cycle from '@cycle/core';
import {h1, div, h, makeDOMDriver} from '@cycle/dom';

function intent(DOM) {
  return {
    scrollWindow$: DOM.select('.scroll-table').events('scroll').
      map((e) => e.target.scrollTop)
  };
}

function visibleItems(itemHeight$, scrollTop$) {
  return Observable.just([{ id: 1 }, { id: 2 }, { id: 3 }]);
}

function model(actions) {
  const itemHeight$ = Observable.just(200);
  const totalItems$ = Observable.just(100);
  const listHeight$ =
    Observable.combineLatest(itemHeight$, totalItems$).
      map(([itemHeight, totalItems]) => itemHeight * totalItems);
  const scrollTop$ = actions.scrollWindow$.startWith(0);
  const items$ = visibleItems(itemHeight$, scrollTop$);

  return Observable.combineLatest(
    listHeight$,
    itemHeight$,
    totalItems$,
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
    map(([listHeight, itemHeight, totalItems, items]) =>
      div('.scroll-wrapper', {
          style: { height: '500px', overflow: "auto" }
        },
        div('.scroll-table', {
            style: { height: listHeight + 'px' }
          },
          div('.items', renderItems(items, itemHeight))
        )
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
