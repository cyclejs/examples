/** @jsx hJSX */
import {run} from '@cycle/core';
import {Observable} from 'rx';
import {makeDOMDriver, hJSX} from '@cycle/dom';

function main() {
  return {
    DOM: Observable.timer(0, 1000)
      .map(i => <div>Seconds elapsed {i}</div>)
  };
}

const drivers = {
 DOM: makeDOMDriver('#main-container')
};

run(main, drivers);
