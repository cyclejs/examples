import {run} from '@cycle/core';
import CycleDOM from '@cycle/dom';
import {Observable} from 'rx'

import Main from './components/index';

const main = Main;

run(main, {
  DOM: CycleDOM.makeDOMDriver('.isolateApp'),
  Props: () => Observable.just([1])
});
