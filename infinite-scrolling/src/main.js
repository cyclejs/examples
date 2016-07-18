import {Observable} from 'rx';
import Cycle from '@cycle/core';
import {h1, div, h, makeDOMDriver} from '@cycle/dom';

function intent(DOM) {
  return {
    scrollWindow$: DOM.select('.scroll-wrapper').events('scroll').
      map((e) => e.target.scrollTop)
  };
}

function retrieveItem(id) {
  return Observable.just({id, status: "loaded" }).delay(500).startWith({id, status: "loading" });
}

function visibleItems(itemHeight$, itemPadding$, totalItems$, wrapperHeight$, scrollTop$) {
  const first_item_id$ =
    itemHeight$.combineLatest(
      itemPadding$, scrollTop$,
      (itemHeight, itemPadding, scrollTop) =>
          Math.floor(scrollTop / (itemHeight + itemPadding)) + 1
    ).
    distinctUntilChanged();

  const visible_item_ids$ =
    first_item_id$.combineLatest(
      itemHeight$, totalItems$, wrapperHeight$,
      function(first_id, itemHeight, totalItems, wrapperHeight) {
        const num_of_visible_items = Math.ceil(wrapperHeight / itemHeight) + 1;
        const item_deltas = Array(num_of_visible_items).fill().map((_, i) => i);
        const item_ids = item_deltas.map((i) => i + first_id).
          filter((id) => id <= totalItems);

        return item_ids;
      }
    )

  const visible_items$ =
    visible_item_ids$.map((ids) => ids.map((id) => retrieveItem(id) )).
      map((items$) => Observable.combineLatest(items$)).
      flatMap((e) => e);

  return visible_items$;
}

function model(actions) {
  const itemHeight$ = Observable.just(200);
  const itemPadding$ = Observable.just(20);
  const itemWidth$ = Observable.just(300);
  const totalItems$ = Observable.just(100);
  const wrapperHeight$ = Observable.just(500);
  const listHeight$ =
    Observable.combineLatest(itemHeight$, itemPadding$, totalItems$).
      map(([itemHeight, itemPadding, totalItems]) =>
        (itemHeight + itemPadding) * totalItems);
  const scrollTop$ = actions.scrollWindow$.startWith(0);
  const items$ = visibleItems(itemHeight$, itemPadding$, totalItems$, wrapperHeight$, scrollTop$);

  return Observable.combineLatest(
    listHeight$, itemHeight$, itemPadding$, itemWidth$, wrapperHeight$,
    totalItems$, items$, scrollTop$
  );
}

function renderItems(items, itemHeight, itemPadding, itemWidth) {
  return items.map((item) => renderItem(item, itemHeight, itemPadding, itemWidth));
}

function renderItem(item, itemHeight, itemPadding, itemWidth) {
  const vtree$ =
    div(
      '.item',
      {
        style: {
          height: itemHeight + 'px',
          width: itemWidth + 'px',
          background: 'red',
          position: "absolute",
          top: ( (itemHeight + itemPadding) * ( item.id - 1 ) ) + "px"
        },
      },
      h1("Item " + item.id + ", status = " + item.status)
    );

  return vtree$;
}

function view(state$) {
  return state$.
    map(([listHeight, itemHeight, itemPadding, itemWidth, wrapperHeight,totalItems, items, scrollTop]) =>
      div(
        [
          h1('scrollTop = ' + scrollTop),
          div('.scroll-wrapper', {
              style: { height: wrapperHeight + 'px', width: itemWidth + "px", overflow: "auto" }
            },
            div('.scroll-table', {
                style: { height: listHeight + 'px', position: "relative" }
              },
              div('.items', renderItems(items, itemHeight, itemPadding, itemWidth))
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
