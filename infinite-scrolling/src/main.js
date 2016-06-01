import {Observable} from 'rx';
import Cycle from '@cycle/core';
import {h1, div, h, makeDOMDriver} from '@cycle/dom';

function intent(DOM) {
  return {
    scrollWindow$: DOM.select('.scroll-wrapper').events('scroll').
      map((e) => e.target.scrollTop)
  };
}

function visibleItems(itemHeight$, wrapperHeight$, scrollTop$) {
  const first_item_id$ =
    itemHeight$.combineLatest(
      scrollTop$,
      (itemHeight, scrollTop) => Math.floor(scrollTop / itemHeight) + 1
    );

  const visible_item_ids$ =
    first_item_id$.combineLatest(
      itemHeight$, wrapperHeight$,
      function(first_id, itemHeight, wrapperHeight) {
        const num_of_visible_items = Math.ceil(wrapperHeight / itemHeight);
        const item_deltas = Array(num_of_visible_items).fill().map((_, i) => i);
        const item_ids = item_deltas.map((i) => i + first_id);

        return item_ids;
      }
    );

  const visible_items$ = visible_item_ids$.map((ids) => ids.map((id) => ( { id } )));

  return visible_items$;
}

function model(actions) {
  const itemHeight$ = Observable.just(200);
  const itemWidth$ = Observable.just(200);
  const totalItems$ = Observable.just(100);
  const wrapperHeight$ = Observable.just(500);
  const listHeight$ =
    Observable.combineLatest(itemHeight$, totalItems$).
      map(([itemHeight, totalItems]) => itemHeight * totalItems);
  const scrollTop$ = actions.scrollWindow$.startWith(0);
  const items$ = visibleItems(itemHeight$, wrapperHeight$, scrollTop$);

  return Observable.combineLatest(
    listHeight$,
    itemHeight$,
    itemWidth$,
    wrapperHeight$,
    totalItems$,
    items$,
    scrollTop$
  );
}

function renderItems(items, itemHeight, itemWidth) {
  return items.map((item) => renderItem(item, itemHeight, itemWidth));
}

function renderItem(item, itemHeight, itemWidth) {
  const vtree$ =
    div(
      '.item',
      {
        style: { height: itemHeight + 'px', width: itemWidth + 'px', background: 'red', position: "absolute", top: itemHeight * ( item.id - 1 ) + "px" }
      },
      h1("Item " + item.id)
    );

  return vtree$;
}

function view(state$) {
  return state$.
    map(([listHeight, itemHeight, itemWidth, wrapperHeight, totalItems, items, scrollTop]) =>
      div(
        [
          h1('scrollTop = ' + scrollTop),
          div('.scroll-wrapper', {
              style: { height: wrapperHeight + 'px', width: itemWidth + "px", overflow: "auto" }
            },
            div('.scroll-table', {
                style: { height: listHeight + 'px', position: "relative" }
              },
              div('.items', renderItems(items, itemHeight, itemWidth))
            )
          )
        ]
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
