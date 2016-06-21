import xs from 'xstream';
import {button, div} from '@cycle/dom';
import Collection from '@cycle/collection';
import Item from './Item';

function createRandomItemProps() {
  let hexColor = Math.floor(Math.random() * 16777215).toString(16);
  while (hexColor.length < 6) {
    hexColor = '0' + hexColor;
  }
  hexColor = '#' + hexColor;
  const randomWidth = Math.floor(Math.random() * 800 + 200);
  return {Props: xs.of({color: hexColor, width: randomWidth})};
}

function makeItems(count) {
  const items = [];

  for (let i = 0; i < count; i += 1) {
    items.push(createRandomItemProps());
  }

  return items;
}

function intent(DOM) {
  return xs.merge(
    DOM.select('.add-one-btn').events('click')
      .map(() => makeItems(1)),

    DOM.select('.add-many-btn').events('click')
      .map(() => makeItems(1000))
  );
}

function view(items$) {
  return Collection.pluck(items$, item => item.DOM)
    .map(items =>
      div('.list', [
        div('.addButtons', [
          button('.add-one-btn', 'Add New Item'),
          button('.add-many-btn', 'Add Many Items')
        ]),

        div(items)
      ])
    );
}

function List(sources) {
  const addItem$ = intent(sources.DOM)
    .startWith({Props: xs.of({color: 'red', width: 300})});

  const items$ = Collection(Item, sources, addItem$, item => item.Remove);

  const vtree$ = view(items$);

  return {
    DOM: vtree$
  };
}

export default List;
