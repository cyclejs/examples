import {run} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import App from './app';

const main = App;

run(main, {
  DOM: makeDOMDriver('#main-container')
});
