import xs from 'xstream';
import {h3, div} from '@cycle/dom';
import Collection from '@cycle/collection';
import Ticker from './Ticker.js';

function makeRandomColor() {
  let hexColor = Math.floor(Math.random() * 16777215).toString(16);
  while (hexColor.length < 6) {
    hexColor = '0' + hexColor;
  }
  hexColor = '#' + hexColor;
  return hexColor;
}

function makeColor$() {
  return xs
    .periodic(1000)
    .map(makeRandomColor)
    .startWith('#000000');
}

function view(children$, name = '') {
  const loading = h3('Loading...');
  return children$.map(children =>
    div('#the-view', children.length > 0 ? children : [loading])
  );
}

function App(sources) {
  const addTicker$ = xs
    .periodic(5000)
    .take(10)
    .map(() => ({color: makeColor$()}));

  const tickers$ = Collection(Ticker, sources, addTicker$);

  const tickerViews$ = Collection.pluck(tickers$, 'DOM');

  const vtree$ = view(tickerViews$);

  const sinks = {
    DOM: vtree$
  };

  return sinks;
}

export default App;
