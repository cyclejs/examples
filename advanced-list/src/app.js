import xs from 'xstream';
import {h3, div} from '@cycle/dom';
import isolate from '@cycle/isolate';
import Ticker from './Ticker.js';
import Collection from 'cycle-collections';

function makeRandomColor() {
  let hexColor = Math.floor(Math.random() * 16777215).toString(16);
  while (hexColor.length < 6) {
    hexColor = '0' + hexColor;
  }
  hexColor = '#' + hexColor;
  return hexColor;
}

function insertReducer(tickers) {
  const color$ = xs.periodic(1000)
    .map(makeRandomColor)
    .startWith('#000000');

  return tickers.add(color$);
}

function model(initialTickers) {
  const insertReducer$ = xs.periodic(5000).take(10)
    .mapTo(insertReducer);

  const action$ = xs.merge(
    insertReducer$,
    initialTickers.action$
  );

  const list$ = action$
    .fold((oldList, reducer) => reducer(oldList), initialTickers)
    .remember();

  return list$;
}

function view(children$, name = '') {
  const loading = h3('Loading...');
  return children$.map(children =>
    div('#the-view', children.length > 0 ? children : [loading])
  );
}

const tickerChildActions = {
  remove$ (tickers, ticker) {
    return tickers.remove(ticker);
  }
};

function App(sources) {
  const tickers = Collection(Ticker, sources, tickerChildActions);

  const tickers$ = model(tickers);

  const tickerViews$ = Collection.pluck(tickers$, 'DOM');

  const vtree$ = view(tickerViews$);

  const sinks = {
    DOM: vtree$
  };

  return sinks;
}

export default App;
