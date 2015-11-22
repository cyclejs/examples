import {run} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHistoryDriver} from '@cycle/history';
import Main from './main'


function mainApp(responses) {
  let requests = Main(responses)
  return requests
}

run(mainApp, {
  DOM: makeDOMDriver('#main-container'),
  History: makeHistoryDriver({
    // if you want hash: false you will need to set up a server
    hash: true,
    queries: true,
  }),
});
