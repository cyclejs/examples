import Rx from 'rx'

import {div, h1} from '@cycle/dom';
import latestObj from 'rx-combine-latest-obj'
import switchPath from 'switch-path'
import routes from '../utils/routes'

function createRouteValue(DOM, History) {
  return function getRouteValue(location) {
    const {value} = switchPath(location.pathname, routes)

    if (typeof value === 'function') {
      const dialogue = value({DOM, History});
      return dialogue;
    }
    return value;
  };
}

const model = ({DOM,History,}) => {
  const childView$ = History
    .map(createRouteValue(DOM, History));

  return latestObj({
    routeValue: childView$
      .flatMap(value => {
        if (value.DOM) {
          return value.DOM;
        }
        return Rx.Observable.just(value);
      })
      .startWith(null)

  }).distinctUntilChanged();
};

const view = state$ => state$.map(
  ({routeValue,}) => {
    return div('.innerContent',[routeValue])
  }
).distinctUntilChanged();

const Content = responses => {
  const state$ = model(responses);
  const view$ = view(state$);

  return {
    DOM: view$,
  };
};

export default Content;
export {Content};
